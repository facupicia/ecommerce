import { CssbuyTransaction, CssbuyRecordGroup } from "./types";

export type RecordAction =
  | "Buy Item"
  | "Value-added services"
  | "Domestic Shipping"
  | "Adjust Price"
  | "Recharge"
  | "Other";

export function normalizeAction(action: string): RecordAction {
  switch (action) {
    case "Buy Item":
      return "Buy Item";
    case "Value-added services":
      return "Value-added services";
    case "Domestic Shipping":
      return "Domestic Shipping";
    case "Adjust Price":
      return "Adjust Price";
    case "Recharge":
      return "Recharge";
    default:
      return "Other";
  }
}

export function parseMoney(money: string | number): number {
  const n = typeof money === "string" ? parseFloat(money.replace(/,/g, "")) : money;
  return isNaN(n) ? 0 : n;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\\'/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOrderId(remark: string): string | undefined {
  // Handles: "Order id: O260624589494", "Order ID:O260624589494", "Item ID:O260618888824"
  const match = remark.match(/(?:Order\s*id|Order\s*ID|Item\s*ID)\s*:?\s*([A-Z0-9]+)/i);
  return match?.[1];
}

function extractProductUrl(remark: string): string | undefined {
  const match = remark.match(/https?:\/\/[^\s'"<>\\]+/i);
  if (!match) return undefined;
  return match[0].replace(/\\/g, "").replace(/&amp;/g, "&");
}

function extractProductName(remark: string): string | undefined {
  // Try to extract text between 《...》
  const match = remark.match(/《([^》]+)》/);
  return match?.[1];
}

function extractQuantity(remark: string): number | undefined {
  const match = remark.match(/Quantity:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractSeller(remark: string): string | undefined {
  const match = remark.match(/seller:([A-Za-z0-9]+)/i);
  return match?.[1];
}

export function parseTransaction(raw: CssbuyTransaction): CssbuyTransaction {
  return {
    ...raw,
    orderId: extractOrderId(raw.remark),
    productName: extractProductName(raw.remark),
    productUrl: extractProductUrl(raw.remark),
    quantity: extractQuantity(raw.remark),
    seller: extractSeller(raw.remark),
  };
}

export function parseRecords(rawList: CssbuyTransaction[]): CssbuyTransaction[] {
  return rawList.map(parseTransaction);
}

export function groupRecordsByOrder(records: CssbuyTransaction[]): CssbuyRecordGroup[] {
  const map = new Map<string, CssbuyTransaction[]>();

  for (const tx of records) {
    const orderId = tx.orderId;
    if (!orderId) continue;
    if (!map.has(orderId)) map.set(orderId, []);
    map.get(orderId)!.push(tx);
  }

  return Array.from(map.entries())
    .map(([orderId, transactions]) => summarizeGroup(orderId, transactions))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

function summarizeGroup(orderId: string, transactions: CssbuyTransaction[]): CssbuyRecordGroup {
  let buyItemTotal = 0;
  let serviceFeeTotal = 0;
  let domesticShippingTotal = 0;
  let adjustPriceTotal = 0;
  let rechargeTotal = 0;
  let otherTotal = 0;

  let productName: string | undefined;
  let productUrl: string | undefined;
  let quantity: number | undefined;

  for (const tx of transactions) {
    const money = parseMoney(tx.money);
    const action = normalizeAction(tx.action);

    switch (action) {
      case "Buy Item":
        buyItemTotal += money;
        if (!productName && tx.productName) productName = tx.productName;
        if (!productUrl && tx.productUrl) productUrl = tx.productUrl;
        if (quantity === undefined && tx.quantity !== undefined) quantity = tx.quantity;
        break;
      case "Value-added services":
        serviceFeeTotal += money;
        break;
      case "Domestic Shipping":
        domesticShippingTotal += money;
        break;
      case "Adjust Price":
        adjustPriceTotal += money;
        break;
      case "Recharge":
        rechargeTotal += money;
        break;
      default:
        otherTotal += money;
    }
  }

  const totalSpent = buyItemTotal + serviceFeeTotal + domesticShippingTotal + adjustPriceTotal + otherTotal;

  return {
    orderId,
    transactions,
    buyItemTotal,
    serviceFeeTotal,
    domesticShippingTotal,
    adjustPriceTotal,
    rechargeTotal,
    otherTotal,
    totalSpent,
    productName,
    productUrl,
    quantity,
  };
}

export function calculateRealItemCost(group: CssbuyRecordGroup): number {
  // Sum everything that is part of the landed cost before international freight and taxes.
  // Recharges are not a cost per item, so excluded.
  return Math.abs(group.buyItemTotal)
    + Math.abs(group.serviceFeeTotal)
    + Math.abs(group.domesticShippingTotal)
    + Math.abs(group.adjustPriceTotal)
    + Math.abs(group.otherTotal);
}

export interface RecordSummary {
  totalRecords: number;
  totalRecharged: number;
  totalSpent: number;
  groupCount: number;
  unlinkedCount: number;
}

export function summarizeRecords(records: CssbuyTransaction[]): RecordSummary {
  let totalRecharged = 0;
  let totalSpent = 0;
  let unlinkedCount = 0;

  for (const tx of records) {
    const money = parseMoney(tx.money);
    const action = normalizeAction(tx.action);
    if (action === "Recharge") {
      totalRecharged += money;
    } else {
      totalSpent += money;
    }
    if (!tx.orderId && action !== "Recharge") {
      unlinkedCount++;
    }
  }

  const groups = groupRecordsByOrder(records);

  return {
    totalRecords: records.length,
    totalRecharged,
    totalSpent,
    groupCount: groups.length,
    unlinkedCount,
  };
}
