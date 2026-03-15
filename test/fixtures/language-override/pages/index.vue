<template>
  <div>
    <h1>Home</h1>

    <!-- Language without override -->
    <div data-testid="no-override">
      <ShowLanguage />
    </div>

    <!-- Language with override to French -->
    <LanguageOverride langcode="fr">
      <div data-testid="override-fr">
        <ShowLanguage />
        <!-- Link resolved inside override scope — does router use override or route language? -->
        <NuxtLink :to="{ name: 'search' }" data-testid="link-inside-override">
          Search inside override
        </NuxtLink>
      </div>
    </LanguageOverride>

    <!-- Language with override to German -->
    <LanguageOverride langcode="de">
      <div data-testid="override-de">
        <ShowLanguage />
        <ShowLanguageFull />
      </div>
    </LanguageOverride>

    <!-- Language with null override (no effect) -->
    <LanguageOverride :langcode="null">
      <div data-testid="override-null">
        <ShowLanguage />
      </div>
    </LanguageOverride>

    <!-- Invalid langcode (should fall back to default) -->
    <LanguageOverride langcode="xx">
      <div data-testid="override-invalid">
        <ShowLanguage />
      </div>
    </LanguageOverride>

    <NuxtLink to="/en/search" data-testid="link-search">Go to Search</NuxtLink>
    <NuxtLink to="/en/about" data-testid="link-about">Go to About</NuxtLink>
    <NuxtLink to="/en/language-links" data-testid="link-language-links">Language Links</NuxtLink>
  </div>
</template>
