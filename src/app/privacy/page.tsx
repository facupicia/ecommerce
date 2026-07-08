import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | plug",
};

export default function PrivacyPage() {
  return (
    <div className="shop-layout flex flex-col min-h-screen bg-white">
      <main className="flex-1 px-4 py-16 sm:py-24 max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--plug-gray)] mb-6">
          Privacidad
        </p>
        <h1 className="plug-font-serif text-4xl sm:text-5xl text-[#1a1a1a] mb-8">
          Política de Privacidad
        </h1>
        <p className="text-[13px] text-[var(--plug-gray)] mb-10">
          Última actualización: 8 de julio de 2026
        </p>

        <div className="space-y-8 text-[14px] leading-relaxed text-[#1a1a1a]">
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              1. Información que recopilamos
            </h2>
            <p className="text-[var(--plug-gray)]">
              Cuando visitás plugrosario.xyz, podemos recopilar:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[var(--plug-gray)]">
              <li>Datos de navegación (páginas visitadas, tiempo en el sitio, dispositivo, navegador) mediante cookies y herramientas de análisis.</li>
              <li>Información que proporcionás voluntariamente al contactarnos por WhatsApp, formularios o al realizar una compra (nombre, teléfono, dirección de envío).</li>
              <li>Datos de interacción con nuestras redes sociales (Instagram, Facebook) cuando interactuás con nuestro contenido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              2. Cómo usamos tu información
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-[var(--plug-gray)]">
              <li>Procesar y enviar tus pedidos.</li>
              <li>Responder consultas y brindar atención al cliente.</li>
              <li>Mejorar la experiencia del sitio web.</li>
              <li>Mostrar contenido relevante y analizar el rendimiento de nuestras publicaciones.</li>
              <li>Cumplir con obligaciones legales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              3. Compartir información con terceros
            </h2>
            <p className="text-[var(--plug-gray)]">
              No vendemos tu información personal. Podemos compartir datos con:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[var(--plug-gray)]">
              <li><strong>Meta Platforms, Inc.</strong> (Facebook/Instagram): para gestionar nuestras redes sociales y analizar interacciones con nuestro contenido a través de la API de Instagram Graph.</li>
              <li><strong>Proveedores de servicios:</strong> plataformas de pago (Mercado Pago), servicios de envío, y herramientas de análisis web que nos ayudan a operar el negocio.</li>
              <li><strong>Autoridades legales:</strong> cuando sea requerido por ley.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              4. Cookies y tecnologías similares
            </h2>
            <p className="text-[var(--plug-gray)]">
              Usamos cookies esenciales para el funcionamiento del sitio y cookies de análisis para entender cómo se usa nuestra web. Podés desactivar las cookies desde la configuración de tu navegador en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              5. Almacenamiento y seguridad
            </h2>
            <p className="text-[var(--plug-gray)]">
              Tus datos se almacenan en servidores seguros y tomamos medidas técnicas y organizativas para protegerlos. Solo el personal autorizado tiene acceso a la información personal. No retenemos datos por más tiempo del necesario para cumplir con los fines descritos en esta política.
            </p>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              6. Derechos del usuario
            </h2>
            <p className="text-[var(--plug-gray)]">
              De acuerdo con la Ley de Protección de Datos Personales (Ley 25.326) de Argentina, tenés derecho a:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[var(--plug-gray)]">
              <li>Acceder a tus datos personales.</li>
              <li>Solicitar la rectificación, actualización o eliminación de tus datos.</li>
              <li>Retirar tu consentimiento en cualquier momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a] mb-3">
              7. Contacto
            </h2>
            <p className="text-[var(--plug-gray)]">
              Para cualquier consulta sobre esta política de privacidad o para ejercer tus derechos, podés contactarnos:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[var(--plug-gray)]">
              <li>Email: theplugrosario@gmail.com</li>
              <li>WhatsApp: +54 9 3464 698460</li>
              <li>Instagram: @theplug.ros</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-[11px] text-[var(--plug-gray)] border-t border-[#d9d9d9]">
        plug — Rosario, Argentina
      </footer>
    </div>
  );
}
