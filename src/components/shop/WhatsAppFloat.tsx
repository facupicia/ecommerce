"use client";

export function WhatsAppFloat() {
  const whatsappUrl = "https://wa.me/5493411234567";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="plug-whatsapp-float group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="plug-whatsapp-pulse flex items-center justify-center w-5 h-5 bg-[#25d366] rounded-full flex-shrink-0 text-white shadow-xs">
        <svg
          className="w-3.5 h-3.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.793 1.451 5.35.002 9.707-4.305 9.71-9.593.001-2.561-1-4.97-2.817-6.788-1.817-1.819-4.23-2.821-6.795-2.822-5.352 0-9.711 4.3-9.715 9.592-.002 1.707.452 3.376 1.312 4.868l-.92 3.36 3.428-.9zM17.505 14.3c-.302-.15-1.786-.88-2.053-.978-.266-.098-.46-.147-.654.148-.193.293-.747.928-.915 1.122-.167.196-.335.22-.637.07-3.038-1.516-3.824-2.189-5.223-4.586-.22-.38.223-.353.64-1.182.074-.15.037-.282-.018-.393-.056-.113-.461-1.111-.63-1.52-.167-.399-.34-.343-.46-.349l-.393-.007c-.137 0-.361.051-.55.257-.19.206-.723.707-.723 1.725s.739 2.001.84 2.139c.102.137 1.455 2.22 3.525 3.114 1.633.707 2.26.837 3.072.846.822.009 2.053-.519 2.308-1.282.254-.764.254-1.42.179-1.558-.076-.139-.279-.22-.58-.37z" />
        </svg>
      </div>
      <span className="hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-500 ease-out whitespace-nowrap">
        ¿Necesitás ayuda?
      </span>
      <span className="sm:hidden">Soporte</span>
    </a>
  );
}
