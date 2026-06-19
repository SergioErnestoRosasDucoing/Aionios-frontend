/**
 * 8.2 Compatibilidad de navegadores y dispositivos
 * Verifica que las páginas críticas renderizan correctamente
 * en los viewports requeridos (desktop, tablet y móvil).
 */

const VIEWPORTS = [
  // Desktop
  { label: "Desktop 1920×1080", width: 1920, height: 1080 },
  { label: "Desktop 1440×900",  width: 1440, height: 900  },
  { label: "Desktop 1280×720",  width: 1280, height: 720  },
  // Tablet
  { label: "Tablet iPad 768×1024", width: 768,  height: 1024 },
  // Móvil
  { label: "Móvil iPhone 14 390×844",    width: 390, height: 844 },
  { label: "Móvil Android típico 360×800", width: 360, height: 800 },
] as const;

const PAGES = [
  { label: "Login",    path: "/login"    },
  { label: "Portal",   path: "/portal"   },
  { label: "Explorar", path: "/portal/explorar" },
] as const;

VIEWPORTS.forEach(({ label, width, height }) => {
  describe(`Viewport: ${label} (${width}×${height})`, () => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    PAGES.forEach(({ label: pageLabel, path }) => {
      it(`${pageLabel} — carga sin errores de layout`, () => {
        cy.visit(path);

        // La página cargó (status 200 implícito al visitar)
        cy.get("body").should("be.visible");

        // No hay desbordamiento horizontal
        cy.window().then((win) => {
          const docWidth  = win.document.documentElement.scrollWidth;
          const viewWidth = win.innerWidth;
          expect(docWidth).to.be.lte(viewWidth + 1); // +1 por redondeo de píxeles
        });

        // El contenido principal es visible
        cy.get("body").invoke("text").should("have.length.gt", 0);
      });
    });

    it("Login — formulario accesible y visible", () => {
      cy.visit("/login");
      cy.get("input[type='email'], input[id='email']").should("be.visible");
      cy.get("input[type='password']").should("be.visible");
      cy.get("button[type='submit'], button").contains(/iniciar|entrar/i).should("be.visible");
    });

    it("Portal — barra de navegación visible", () => {
      cy.visit("/portal");
      cy.get("header").should("be.visible");
    });
  });
});
