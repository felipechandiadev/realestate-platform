# Auditoría breve de `'use client'` (portal)

Fase 6: inventario, **sin conversión masiva**. Priorizar páginas (`page.tsx`) que solo muestran datos fetchables en servidor.

Total archivos con `use client` bajo `portal/app`: **60**.

| Archivo | Nota |
|---|---|
| `app/ClientProviders.tsx` | Revisar si parte puede ser server. |
| `app/PortalClient.tsx` | Revisar si parte puede ser server. |
| `app/RootClient.tsx` | Revisar si parte puede ser server. |
| `app/blog/article/[id]/ArticleDetailCard.tsx` | Revisar si parte puede ser server. |
| `app/blog/article/[id]/RelatedArticleMiniCard.tsx` | Revisar si parte puede ser server. |
| `app/blog/article/[id]/RelatedArticlesSection.tsx` | Revisar si parte puede ser server. |
| `app/blog/article/[id]/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/blog/ui/ArticleCard.tsx` | Revisar si parte puede ser server. |
| `app/blog/ui/ArticleCardSkeleton.tsx` | OK como client (animación/UI). |
| `app/blog/ui/BlogList.tsx` | Revisar si parte puede ser server. |
| `app/blog/ui/CategoriesBlog.tsx` | Revisar si parte puede ser server. |
| `app/blog/ui/CategoriesBlogSkeleton.tsx` | OK como client (animación/UI). |
| `app/favorites/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/forgot-password/ForgotPasswordForm.tsx` | Revisar si parte puede ser server. |
| `app/layout.portal.tsx` | Revisar si parte puede ser server. |
| `app/myContracts/[id]/payments/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/myContracts/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/myProperties/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/notifications/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/ourTeam/ui/TeamMembersDisplay.tsx` | Revisar si parte puede ser server. |
| `app/personalInfo/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/properties/property/[id]/MultimediaGrid.tsx` | Revisar si parte puede ser server. |
| `app/properties/property/[id]/PropertyDetailClient.tsx` | Revisar si parte puede ser server. |
| `app/properties/property/[id]/PropertyGallery.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/properties/property/[id]/PropertyMap.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/properties/property/[id]/PropertyMapWrapper.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/properties/property/[id]/SharePropertyDialog.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/properties/sale/PaginationWrapper.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/providers.tsx` | Revisar si parte puede ser server. |
| `app/publish/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/rent-property/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/reset-password/ResetPasswordForm.tsx` | Revisar si parte puede ser server. |
| `app/sell-property/FeaturedSaleProperties.tsx` | Revisar si parte puede ser server. |
| `app/sell-property/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/services/management/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/test-colors/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/ui/FeaturedPropertiesBand.tsx` | Revisar si parte puede ser server. |
| `app/ui/FeaturedPropertiesList.tsx` | Revisar si parte puede ser server. |
| `app/ui/FeaturedPropertyCard.tsx` | Revisar si parte puede ser server. |
| `app/ui/FeaturedPropertyCardIcons.tsx` | Revisar si parte puede ser server. |
| `app/ui/FeaturedSection.tsx` | Revisar si parte puede ser server. |
| `app/ui/ListProperties.tsx` | Revisar si parte puede ser server. |
| `app/ui/LoginForm.tsx` | Revisar si parte puede ser server. |
| `app/ui/NavBar.tsx` | Revisar si parte puede ser server. |
| `app/ui/PortalFooter.tsx` | Revisar si parte puede ser server. |
| `app/ui/PropertyCard.tsx` | Revisar si parte puede ser server. |
| `app/ui/PropertyFilter.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/RegisterForm.tsx` | Revisar si parte puede ser server. |
| `app/ui/RelatedPropertyCard.tsx` | Revisar si parte puede ser server. |
| `app/ui/Slider.tsx` | Revisar si parte puede ser server. |
| `app/ui/Wsp.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/filters/FilterFormSections.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/filters/MobileFilterChips.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/filters/MobileFilterDrawer.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/filters/OperationListingsClient.tsx` | Revisar si parte puede ser server. |
| `app/ui/filters/PropertyFiltersSidebar.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/ui/filters/PropertyListingsLayout.tsx` | Revisar si parte puede ser server. |
| `app/ui/filters/StickyFilterButton.tsx` | Probable client justificado (interactividad/browser APIs). |
| `app/valuation/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |
| `app/verify-email/page.tsx` | Página marcada client — evaluar si el fetch puede vivir en server component + island. |

## Candidatos prioritarios a server + island

- `app/personalInfo/page.tsx`, `app/myContracts/page.tsx`, `app/favorites/page.tsx` — suelen poder cargar sesión/datos en server y dejar formularios como client.
- `app/blog/article/[id]/page.tsx`, `app/sell-property/page.tsx`, `app/publish/page.tsx`, `app/verify-email/page.tsx`.
- Shells `PortalClient.tsx` / `RootClient.tsx`: mantener client; mover data fetching hacia arriba cuando sea seguro.

No se cambió código aquí a propósito (fase 6 solo audita).
