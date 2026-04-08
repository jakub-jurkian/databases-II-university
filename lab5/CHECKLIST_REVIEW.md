# Lab 5 Review Checklist

## 1. Konfiguracja i seed

- [ ] `mongo/client.js` eksportuje `client`, `heroProfiles()` i `heroAuditLog()`.
- [ ] URI jest pobierane z `.env` przez `MONGODB_URI`.
- [ ] `node mongo/seed.js` usuwa wcześniejsze dane z `heroProfiles`.
- [ ] Seed wstawia dokładnie 20 profili jednym `insertMany`.
- [ ] `heroId` w Mongo odpowiada `Hero.id` z PostgreSQL.
- [ ] `stats.totalMissions` jest zgodne z `missionsCount` z PostgreSQL.
- [ ] Uruchomienie seeda dwa razy nie tworzy duplikatów, bo kolekcja jest czyszczona przed insertem.

## 2. Odczyt profili

- [ ] `GET /api/v1/heroes/:id/profile` używa `findOne({ heroId, deletedAt: null })`.
- [ ] W odpowiedzi nie ma pola `deletedAt`.
- [ ] Brak profilu lub soft-delete zwraca `404`.
- [ ] `GET /api/v1/heroes/profiles` obsługuje:
  - [ ] `powers` przez `$in`
  - [ ] `minMissions` przez `$gte`
  - [ ] `withBio=true` przez `$exists: true`
  - [ ] `specialization` jako dopasowanie elementu tablicy
  - [ ] `page` i `limit` przez `skip/limit`
  - [ ] sortowanie malejące po `stats.totalMissions`
  - [ ] tylko profile aktywne (`deletedAt: null`)

## 3. Operacje zapisu

- [ ] `PATCH /api/v1/heroes/:id/profile` aktualizuje tylko `bio` przez `$set`.
- [ ] `POST /api/v1/heroes/:id/profile/specializations` używa `$addToSet`.
- [ ] To samo specialization dodane dwa razy nie tworzy duplikatu.
- [ ] `DELETE /api/v1/heroes/:id/profile/specializations/:name` używa `$pull`.
- [ ] `PATCH /api/v1/incidents/:id/resolve` aktualizuje Mongo po transakcji Prisma.
- [ ] `recentIncidents` trzyma maksymalnie 5 ostatnich wpisów przez `$push` + `$each` + `$slice: -5`.
- [ ] `stats.totalMissions` zwiększa się zawsze o 1.
- [ ] `stats.criticalMissions` zwiększa się tylko dla `level === 'critical'`.
- [ ] `stats.lastMissionAt` i `updatedAt` są aktualizowane.

## 4. Soft-delete i transakcja

- [ ] `DELETE /api/v1/heroes/:id/profile` nie usuwa dokumentu fizycznie.
- [ ] Zamiast tego ustawia `deletedAt: new Date()`.
- [ ] Operacja jest atomowa z wpisem do `heroAuditLog`.
- [ ] W transakcji `withTransaction` wszystkie operacje używają `{ session }`.
- [ ] `session.endSession()` jest wywoływany zawsze po transakcji.
- [ ] Błąd w callbacku powoduje rollback obu operacji.
- [ ] Da się zasymulować rollback przez duplicate key w `heroAuditLog`.