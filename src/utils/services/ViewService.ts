// Servicio para gestión de vistas y navegación

import { URL_BASE } from "@/variables";
import { VIEW_BACKGROUND_MAP } from '../constants';

export class ViewService {
  private currentView: string = "view1";
  private mainContainer: HTMLElement | null = null;

  constructor() {
    this.mainContainer = document.getElementById("main-container");
    this.initializeNavigation();
    this.initializeCustomEvents();
  }

  /**
   * Inicializa la navegación entre vistas
   */
  private initializeNavigation(): void {
    const navButtons = document.querySelectorAll(".view-nav-btn");
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        const viewId = target.getAttribute("data-view");
        const bgImage = target.getAttribute("data-bg");

        if (viewId) {
          this.switchView(viewId, bgImage);
        }
      });
    });
  }

  /**
   * Inicializa eventos personalizados
   */
  private initializeCustomEvents(): void {
    document.addEventListener("switchToView", (e: any) => {
      const { viewId } = e.detail;
      const bgImage = VIEW_BACKGROUND_MAP[viewId] || "banner2";
      this.switchView(viewId, bgImage);
    });
  }

  /**
   * Cambia entre vistas
   */
  switchView(viewId: string, bgImage?: string | null): void {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (bgImage && this.mainContainer) {
      const urlBase = URL_BASE || "";
      this.mainContainer.style.backgroundImage = `url('${urlBase}/img/bg/${bgImage}.webp')`;
    }

    const currentViewElement = document.getElementById(this.currentView);
    const newViewElement = document.getElementById(viewId);

    currentViewElement?.classList.add("hidden");
    currentViewElement?.classList.remove("active");
    newViewElement?.classList.remove("hidden");
    newViewElement?.classList.add("active");

    this.currentView = viewId;
    this.updateLogo(viewId);

    // Disparar evento para que otros servicios puedan reaccionar
    document.dispatchEvent(new CustomEvent('viewChanged', { 
      detail: { 
        oldView: this.currentView, 
        newView: viewId 
      } 
    }));
  }

  /**
   * Actualiza el logo según la vista actual
   */
  private updateLogo(currentView: string): void {
    const logo = document.getElementById("dynamic-logo") as HTMLImageElement;
    if (!logo) return;

    const whiteLogo = logo.getAttribute("data-white-logo");
    const colorLogo = logo.getAttribute("data-color-logo");

    if (!whiteLogo || !colorLogo) return;

    logo.src =
      currentView === "view1" || currentView === "view4"
        ? whiteLogo
        : colorLogo;
  }

  /**
   * Obtiene la vista actual
   */
  getCurrentView(): string {
    return this.currentView;
  }

  /**
   * Verifica si una vista específica está activa
   */
  isViewActive(viewId: string): boolean {
    return this.currentView === viewId;
  }
}
