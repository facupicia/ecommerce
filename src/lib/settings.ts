import { supabaseAdmin } from "./supabase";

export interface ShopSettings {
  isBlocked: boolean;
  title: string;
  comingSoonMessage: string;
  openingDate?: string | null;
  announcement: string;
  announcementEnabled: boolean;
  announcementLink?: string | null;
}

const DEFAULT_SETTINGS: ShopSettings = {
  isBlocked: false,
  title: "Falta poco para abrir",
  comingSoonMessage: "Estamos preparando la mejor experiencia para ti. Suscríbete para recibir novedades o vuelve pronto.",
  openingDate: null,
  announcement: "",
  announcementEnabled: false,
  announcementLink: null,
};

export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from("shop_products")
      .select("*")
      .eq("slug", "__shop_settings__")
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings from Supabase:", error);
      return DEFAULT_SETTINGS;
    }

    if (!data) {
      // Create settings product with default values
      const { data: newData, error: insertError } = await supabaseAdmin
        .from("shop_products")
        .insert({
          slug: "__shop_settings__",
          nombre: "Configuración de la Tienda",
          descripcion: JSON.stringify(DEFAULT_SETTINGS),
          precio_ars: 0,
          publicado: false, // Always false, so it's not indexed in public catalog
          fotos: [],
          categoria: "settings",
          stock: 0,
          peso_g: 0,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          // Concurrency: someone else inserted it. Fetch it again.
          const { data: retryData } = await supabaseAdmin
            .from("shop_products")
            .select("*")
            .eq("slug", "__shop_settings__")
            .maybeSingle();
          if (retryData) {
            try {
              return JSON.parse(retryData.descripcion) as ShopSettings;
            } catch {
              return DEFAULT_SETTINGS;
            }
          }
          return DEFAULT_SETTINGS;
        }
        console.error("Error creating default settings:", insertError);
        return DEFAULT_SETTINGS;
      }
      return DEFAULT_SETTINGS;
    }

    try {
      return JSON.parse(data.descripcion) as ShopSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.error("Unhandled error in getShopSettings:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateShopSettings(settings: ShopSettings): Promise<boolean> {
  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("shop_products")
      .select("id")
      .eq("slug", "__shop_settings__")
      .maybeSingle();

    if (selectError) {
      console.error("Error checking settings existence:", selectError);
      return false;
    }

    if (existing) {
      // Update
      const { error: updateError } = await supabaseAdmin
        .from("shop_products")
        .update({
          descripcion: JSON.stringify(settings),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating settings row:", updateError);
        return false;
      }
    } else {
      // Insert
      const { error: insertError } = await supabaseAdmin
        .from("shop_products")
        .insert({
          slug: "__shop_settings__",
          nombre: "Configuración de la Tienda",
          descripcion: JSON.stringify(settings),
          precio_ars: 0,
          publicado: false,
          fotos: [],
          categoria: "settings",
          stock: 0,
          peso_g: 0,
        });

      if (insertError) {
        console.error("Error inserting settings row:", insertError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Unhandled error in updateShopSettings:", err);
    return false;
  }
}
