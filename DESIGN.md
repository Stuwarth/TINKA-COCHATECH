# Design System: Tinka Coach IA
*Generado siguiendo el estándar Impeccable / Google Stitch*

## 1. Brand Identity
- **Personality:** Empático, Profesional, Accesible, Confiable.
- **Register:** Product UI (Herramienta de trabajo diario para microempresarios).
- **Anti-references:** Diseños aburridos de contabilidad tradicional. Evitar el "AI Slop" (degradados morados genéricos, tarjetas anidadas sin sentido, fuentes sobreexplotadas).

## 2. Color Palette
- **Primary (FIE Magenta):** `#C40079` - Usado para llamadas a la acción principales y acentos de marca.
- **Secondary (FIE Blue):** `#002C6A` - Usado para fondos profundos y contrastes fuertes.
- **Backgrounds:** `bg-gray-50` para legibilidad máxima, `bg-gray-900` para fondos premium (Modo oscuro en cabeceras).
- **Success:** `text-green-600` / `bg-green-50` para métricas positivas.

## 3. Typography
- **Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Hierarchy:**
  - Números GIGANTES y claros para montos monetarios (legibilidad a distancia).
  - Etiquetas descriptivas pequeñas, en mayúsculas y espaciadas (`text-[11px] uppercase tracking-widest text-gray-400`).

## 4. Components & Shapes
- **Bordes:** Muy redondeados (`rounded-2xl`, `rounded-3xl`, `rounded-full`) para dar sensación amigable y moderna (estilo Apple/NuBank).
- **Sombras:** Suaves y amplias (`shadow-xl shadow-gray-200/60`) para dar flotabilidad sin ensuciar la pantalla.
- **Teclados:** Estilo cajero/iOS, botones circulares sin bordes, amplio espacio para evitar toques accidentales.

## 5. Interaction & Motion
- Micro-animaciones en transiciones de pantalla (`animate-in slide-in-from-bottom-4`).
- Efecto de pulso (`animate-pulse`) solo para elementos vivos (ej. estado de conexión del Coach IA).
- Botones con feedback táctil (`active:scale-95`).
