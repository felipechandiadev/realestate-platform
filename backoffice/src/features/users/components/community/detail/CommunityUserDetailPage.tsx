'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconButton } from '@realestate/ui';
import {
  getCommunityUserHeader,
  type CommunityUserDetailHeader,
} from '@/features/users/actions/users.action';
import { CommunityUserDetailSectionNav } from './CommunityUserDetailSectionNav';
import {
  COMMUNITY_USER_DETAIL_TABS,
  type CommunityUserDetailSectionId,
  communityUserDetailSectionFromHash,
} from './community-user-detail-section.types';
import { AccountSection } from './sections/AccountSection';
import { ProfileSection } from './sections/ProfileSection';
import { IdentitySection } from './sections/IdentitySection';
import { FavoritesSection } from './sections/FavoritesSection';
import { InterestSection } from './sections/InterestSection';
import { DocumentsSection } from './sections/DocumentsSection';
import { ActivitySection } from './sections/ActivitySection';

type CommunityUserDetailPageProps = {
  userId: string;
  initialHeader: CommunityUserDetailHeader;
};

export function CommunityUserDetailPage({
  userId,
  initialHeader,
}: CommunityUserDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [header, setHeader] = useState<CommunityUserDetailHeader>(initialHeader);
  const [activeSection, setActiveSection] =
    useState<CommunityUserDetailSectionId>('cuenta');

  useEffect(() => {
    setHeader(initialHeader);
  }, [initialHeader]);

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = communityUserDetailSectionFromHash(window.location.hash);
      if (fromHash) setActiveSection(fromHash);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const selectSection = useCallback((id: CommunityUserDetailSectionId) => {
    setActiveSection(id);
    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, []);

  const refreshHeader = useCallback(async () => {
    const response = await getCommunityUserHeader(userId);
    if (response.success && response.data) {
      setHeader(response.data);
    }
    router.refresh();
  }, [userId, router]);

  const goBack = useCallback(() => {
    const returnTo = searchParams.get('returnTo')?.trim();
    if (returnTo && returnTo.startsWith('/users/community')) {
      router.push(returnTo);
      return;
    }
    router.push('/users/community');
  }, [router, searchParams]);

  const isActive = header.status === 'ACTIVE';

  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-3 px-0 py-2 sm:space-y-6 sm:px-6 sm:py-6"
      data-test-id="community-user-detail-root"
    >
      <header
        className="border-b border-border pb-2 sm:pb-4"
        data-test-id="community-user-detail-header"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
          <IconButton
            icon="arrow_back"
            variant="action"
            size="sm"
            onClick={goBack}
            ariaLabel="Volver al listado de comunidad"
            title="Volver"
            data-test-id="community-user-detail-back"
          />
          <h1
            className="min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-3xl"
            title={header.displayName}
          >
            {header.displayName}
          </h1>
          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Activo' : header.status || 'Inactivo'}
          </span>
          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              header.emailVerified
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {header.emailVerified ? 'Email verificado' : 'Email pendiente'}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-3">{header.email}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {header.username} · ID: {userId}
        </p>
      </header>

      <CommunityUserDetailSectionNav
        tabs={COMMUNITY_USER_DETAIL_TABS}
        activeId={activeSection}
        onSelect={selectSection}
      />

      <div
        id={`community-user-section-panel-${activeSection}`}
        role="tabpanel"
        aria-labelledby={`community-user-section-tab-${activeSection}`}
        className="min-h-[16rem]"
        data-test-id="community-user-detail-section-panel"
        data-active-section={activeSection}
      >
        {activeSection === 'cuenta' ? (
          <AccountSection
            userId={userId}
            header={header}
            onUpdateSuccess={refreshHeader}
          />
        ) : null}
        {activeSection === 'perfil' ? <ProfileSection header={header} /> : null}
        {activeSection === 'identidad' ? <IdentitySection header={header} /> : null}
        {activeSection === 'favoritos' ? <FavoritesSection userId={userId} /> : null}
        {activeSection === 'interes' ? (
          <InterestSection userId={userId} email={header.email} />
        ) : null}
        {activeSection === 'documentos' ? (
          <DocumentsSection personId={header.person?.id} />
        ) : null}
        {activeSection === 'actividad' ? <ActivitySection header={header} /> : null}
      </div>
    </div>
  );
}

export default CommunityUserDetailPage;
