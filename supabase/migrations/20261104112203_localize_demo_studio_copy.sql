-- Keep the seeded studio copy consistent with the six-language demonstration catalog.
-- User-authored descriptions are preserved by the exact source-text predicate.
update public.services set description_pt='Grave seu podcast ou conteúdo com microfones e ambiente tratado acusticamente.'
where name='Estúdio de podcast Premium'
  and description_pt='Uma hora no estúdio com microfones profissionais e ambiente acústico.';
