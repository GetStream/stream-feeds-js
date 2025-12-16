# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.3.21](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.20...@stream-io/feeds-client-0.3.21) (2025-12-16)


* add mentioned user id to updateActivity [FEEDS-748] ([#192](https://github.com/GetStream/stream-feeds-js/issues/192)) ([72e9b94](https://github.com/GetStream/stream-feeds-js/commit/72e9b947d9c4a2e6472832c8c09fd1811ae67244))

## [0.3.20](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.19...@stream-io/feeds-client-0.3.20) (2025-12-15)


### Bug Fixes

* **react-native:** axios default require in cjs ([#190](https://github.com/GetStream/stream-feeds-js/issues/190)) ([039d952](https://github.com/GetStream/stream-feeds-js/commit/039d952928b599bb7a92b90cedd5470a2573f53d))

## [0.3.19](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.18...@stream-io/feeds-client-0.3.19) (2025-12-11)


### Bug Fixes

* reactive state updates for follow/unfollow ([#188](https://github.com/GetStream/stream-feeds-js/issues/188)) ([841d436](https://github.com/GetStream/stream-feeds-js/commit/841d43605a5f47cc929b3865f6c13ad26dbbf4c0))

## [0.3.18](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.17...@stream-io/feeds-client-0.3.18) (2025-12-10)


### Bug Fixes

* backfill current feed ([#187](https://github.com/GetStream/stream-feeds-js/issues/187)) ([e215250](https://github.com/GetStream/stream-feeds-js/commit/e215250141aae281464fcec6267934c9a1aecb11))

## [0.3.17](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.16...@stream-io/feeds-client-0.3.17) (2025-12-08)


### Features

* idempotent follow - getOrCreateFollows ([#183](https://github.com/GetStream/stream-feeds-js/issues/183)) ([f327974](https://github.com/GetStream/stream-feeds-js/commit/f3279748d938add84c245bc21e71a73d92a6973b))
* use new ownBatch endpoint (this is an internal endpoint) ([#181](https://github.com/GetStream/stream-feeds-js/issues/181)) ([f9dca65](https://github.com/GetStream/stream-feeds-js/commit/f9dca65cfa164e3da60ac3dc0ddecbd8b38770e2))


### Bug Fixes

* remove anon login, it won't be supported for now ([#185](https://github.com/GetStream/stream-feeds-js/issues/185)) ([d9230ba](https://github.com/GetStream/stream-feeds-js/commit/d9230bafff5ebf7d0a8cb598585896a02b23048a))

## [0.3.16](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.15...@stream-io/feeds-client-0.3.16) (2025-12-03)


* fix lint issues in sample apps ([#172](https://github.com/GetStream/stream-feeds-js/issues/172)) ([eec1ea5](https://github.com/GetStream/stream-feeds-js/commit/eec1ea5502452310606df6032acb36a724d5e714))
* update test setup for anon users ([#175](https://github.com/GetStream/stream-feeds-js/issues/175)) ([c818f71](https://github.com/GetStream/stream-feeds-js/commit/c818f71115f47645bf21f460e6a2398d2d3cac69))


### Features

* Add activity_count to feed response ([#180](https://github.com/GetStream/stream-feeds-js/issues/180)) ([40fa693](https://github.com/GetStream/stream-feeds-js/commit/40fa693cced4ced64986961fe5a7f59e04addd82))

## [0.3.15](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.14...@stream-io/feeds-client-0.3.15) (2025-11-28)


### Features

* support anonymous user connect ([#174](https://github.com/GetStream/stream-feeds-js/issues/174)) ([3463ccf](https://github.com/GetStream/stream-feeds-js/commit/3463ccfc4bfd952ee79a531a0c9928bfd53e8096))

## [0.3.14](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.13...@stream-io/feeds-client-0.3.14) (2025-11-28)


* [FEEDS-991] regenerate SDK ([#170](https://github.com/GetStream/stream-feeds-js/issues/170)) ([cdf3cb2](https://github.com/GetStream/stream-feeds-js/commit/cdf3cb2af6abbd326ad74f5e88e4a657ee39bb77))


### Features

* Add enrichment options for getOrCreateFeed ([#173](https://github.com/GetStream/stream-feeds-js/issues/173)) ([e662fb7](https://github.com/GetStream/stream-feeds-js/commit/e662fb789a620cf6e174b183d9f42c22b5d11f26))

## [0.3.13](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.12...@stream-io/feeds-client-0.3.13) (2025-11-19)


### Features

* Add url enrichment fields for activities and comments ([#168](https://github.com/GetStream/stream-feeds-js/issues/168)) ([7389873](https://github.com/GetStream/stream-feeds-js/commit/73898737b3f555183b402c523461e2cbb860465a))

## [0.3.12](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.11...@stream-io/feeds-client-0.3.12) (2025-11-18)


### Bug Fixes

* OwnUser type misses name and image ([#166](https://github.com/GetStream/stream-feeds-js/issues/166)) ([fa8121d](https://github.com/GetStream/stream-feeds-js/commit/fa8121daae8dd75dc469b7e8158c130fc40a0065))

## [0.3.11](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.10...@stream-io/feeds-client-0.3.11) (2025-11-17)


* regenerate SDK ([#165](https://github.com/GetStream/stream-feeds-js/issues/165)) ([7db5d06](https://github.com/GetStream/stream-feeds-js/commit/7db5d065a49993a359948ea9e2f7c288a34af443))

## [0.3.10](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.9...@stream-io/feeds-client-0.3.10) (2025-11-14)


### Bug Fixes

* add missing current_feed when updating from WS event ([#164](https://github.com/GetStream/stream-feeds-js/issues/164)) ([3516b19](https://github.com/GetStream/stream-feeds-js/commit/3516b1939eeb9e966c65b1d7fd5980d305f96726))

## [0.3.9](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.8...@stream-io/feeds-client-0.3.9) (2025-11-14)


### Bug Fixes

* add missing current_feed in activity.updated ([e6f0d94](https://github.com/GetStream/stream-feeds-js/commit/e6f0d94c9862549844df58a3152d3eb3177b43fb))

## [0.3.8](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.7...@stream-io/feeds-client-0.3.8) (2025-11-12)


### Features

* watch activity ([#149](https://github.com/GetStream/stream-feeds-js/issues/149)) ([9e9c423](https://github.com/GetStream/stream-feeds-js/commit/9e9c42307a6571e826de8a3b1d83a411f4577d4d))

## [0.3.7](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.6...@stream-io/feeds-client-0.3.7) (2025-11-11)


### Features

* [FEEDS-849] support for Feeds collections ([#154](https://github.com/GetStream/stream-feeds-js/issues/154)) ([d00be39](https://github.com/GetStream/stream-feeds-js/commit/d00be39f4a53fd50c9a4648311c9fa84d85fc2cf))

## [0.3.6](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.5...@stream-io/feeds-client-0.3.6) (2025-11-05)


### Bug Fixes

* don't throw error if getOrCreate is called twice with same config ([#160](https://github.com/GetStream/stream-feeds-js/issues/160)) ([200ade9](https://github.com/GetStream/stream-feeds-js/commit/200ade940691c64101d41375ce675139858e8409))

## [0.3.5](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.4...@stream-io/feeds-client-0.3.5) (2025-11-04)


### Features

* Migrate to instance-based logger ([#159](https://github.com/GetStream/stream-feeds-js/issues/159)) ([f2854e0](https://github.com/GetStream/stream-feeds-js/commit/f2854e090da8526f87f89bccd95659de6d2a5069))

## [0.3.4](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.3...@stream-io/feeds-client-0.3.4) (2025-11-04)


### Bug Fixes

* forward all relevant config options from getOrCreate in getNextPage ([#158](https://github.com/GetStream/stream-feeds-js/issues/158)) ([a6216a8](https://github.com/GetStream/stream-feeds-js/commit/a6216a83d26f7045e8fcc38b6ff142e5bc75f7e6))
* getNextPage returns undefined if there is no more page to fetch ([#157](https://github.com/GetStream/stream-feeds-js/issues/157)) ([7bf9093](https://github.com/GetStream/stream-feeds-js/commit/7bf90938585032aec9160b6f07885dd5a681953f))

## [0.3.3](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.2...@stream-io/feeds-client-0.3.3) (2025-10-31)


### Features

* client-side features to support reading feeds with filter ([#155](https://github.com/GetStream/stream-feeds-js/issues/155)) ([8552de1](https://github.com/GetStream/stream-feeds-js/commit/8552de1566560b436b1e62189f0497f8d14fe57f))


### Bug Fixes

* check pinned activities as well when updating from user events ([#153](https://github.com/GetStream/stream-feeds-js/issues/153)) ([d895b94](https://github.com/GetStream/stream-feeds-js/commit/d895b94544eaf58d94467e02f12fce0c5f2f620e))

## [0.3.2](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.1...@stream-io/feeds-client-0.3.2) (2025-10-30)


* add new docs snippet tests ([35c888d](https://github.com/GetStream/stream-feeds-js/commit/35c888d4f0f55a14e7df55a3bc1e7c28acc04130))


### Features

* [FEEDS-702] Gen new openapi spec for restrict replies field ([#152](https://github.com/GetStream/stream-feeds-js/issues/152)) ([2ebb6fb](https://github.com/GetStream/stream-feeds-js/commit/2ebb6fb0dffd18ad65e39f479924a19cdeb488b5))

## [0.3.1](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.0...@stream-io/feeds-client-0.3.1) (2025-10-30)


* **@stream-io/feeds-client:** release version 0.3.1 ([a824636](https://github.com/GetStream/stream-feeds-js/commit/a82463672e03f03dd7318d3c7b7cf91bd5de0a96))
* **@stream-io/feeds-client:** release version 0.3.1 ([1fbc6fd](https://github.com/GetStream/stream-feeds-js/commit/1fbc6fd1ddd71c83a2a285249b234005a851fcf2))
* add docs test for update partial ([c4b3d73](https://github.com/GetStream/stream-feeds-js/commit/c4b3d739ff5e88dc288fb95f67f09732a95d2c37))
* add sharing activity snippet ([fb4db2d](https://github.com/GetStream/stream-feeds-js/commit/fb4db2d2aaf9422830defbdb54fb34f0c72f145f))
* reenable failing tests ([8c3a02a](https://github.com/GetStream/stream-feeds-js/commit/8c3a02adbe566c3e44a28d57cda1a2a23fe94589))


### Features

* activity feedback event handler; follow suggestion API changes ([#150](https://github.com/GetStream/stream-feeds-js/issues/150)) ([65f4d3e](https://github.com/GetStream/stream-feeds-js/commit/65f4d3edde3c6e5a96d5b5bd87d95bab83cde6ef))

## [0.3.1](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.0...@stream-io/feeds-client-0.3.1) (2025-10-30)


* **@stream-io/feeds-client:** release version 0.3.1 ([1fbc6fd](https://github.com/GetStream/stream-feeds-js/commit/1fbc6fd1ddd71c83a2a285249b234005a851fcf2))
* add docs test for update partial ([c4b3d73](https://github.com/GetStream/stream-feeds-js/commit/c4b3d739ff5e88dc288fb95f67f09732a95d2c37))
* add sharing activity snippet ([fb4db2d](https://github.com/GetStream/stream-feeds-js/commit/fb4db2d2aaf9422830defbdb54fb34f0c72f145f))
* reenable failing tests ([8c3a02a](https://github.com/GetStream/stream-feeds-js/commit/8c3a02adbe566c3e44a28d57cda1a2a23fe94589))


### Features

* activity feedback event handler; follow suggestion API changes ([#150](https://github.com/GetStream/stream-feeds-js/issues/150)) ([65f4d3e](https://github.com/GetStream/stream-feeds-js/commit/65f4d3edde3c6e5a96d5b5bd87d95bab83cde6ef))

## [0.3.1](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.3.0...@stream-io/feeds-client-0.3.1) (2025-10-30)


* add docs test for update partial ([c4b3d73](https://github.com/GetStream/stream-feeds-js/commit/c4b3d739ff5e88dc288fb95f67f09732a95d2c37))
* add sharing activity snippet ([fb4db2d](https://github.com/GetStream/stream-feeds-js/commit/fb4db2d2aaf9422830defbdb54fb34f0c72f145f))
* reenable failing tests ([8c3a02a](https://github.com/GetStream/stream-feeds-js/commit/8c3a02adbe566c3e44a28d57cda1a2a23fe94589))


### Features

* activity feedback event handler; follow suggestion API changes ([#150](https://github.com/GetStream/stream-feeds-js/issues/150)) ([65f4d3e](https://github.com/GetStream/stream-feeds-js/commit/65f4d3edde3c6e5a96d5b5bd87d95bab83cde6ef))

## [0.3.0](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.21...@stream-io/feeds-client-0.3.0) (2025-10-22)


### ⚠ BREAKING CHANGES

* remove unstable util hooks (#146)

### Features

* remove unstable util hooks ([#146](https://github.com/GetStream/stream-feeds-js/issues/146)) ([ac2f6b2](https://github.com/GetStream/stream-feeds-js/commit/ac2f6b26887286695f1c6a31a5616ef4fc0166e0))

## [0.2.21](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.20...@stream-io/feeds-client-0.2.21) (2025-10-22)


* fix tests ([d076fcf](https://github.com/GetStream/stream-feeds-js/commit/d076fcf3838bb46795b73796462ac083841cb7b6))


### Bug Fixes

* resolve [@self](https://github.com/self) in emitted declarations ([#143](https://github.com/GetStream/stream-feeds-js/issues/143)) ([30f7966](https://github.com/GetStream/stream-feeds-js/commit/30f796633a18b49fcea4f0275fd85748f70e44f3)), closes [#142](https://github.com/GetStream/stream-feeds-js/issues/142)

## [0.2.20](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.19...@stream-io/feeds-client-0.2.20) (2025-10-20)


### Bug Fixes

* only send maximum 100 feeds to batch capabilities endpoint ([#141](https://github.com/GetStream/stream-feeds-js/issues/141)) ([5d662da](https://github.com/GetStream/stream-feeds-js/commit/5d662dac991296025612ddad8db076259a04e910))

## [0.2.19](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.18...@stream-io/feeds-client-0.2.19) (2025-10-20)


* fix failing docs snippet test ([b2ccd01](https://github.com/GetStream/stream-feeds-js/commit/b2ccd014150877640f7b50ff954310360839cb1b))


### Features

* ingest own capabilities from responses ([#129](https://github.com/GetStream/stream-feeds-js/issues/129)) ([224d79b](https://github.com/GetStream/stream-feeds-js/commit/224d79b5b8cd1b20c56dd976c163f7071b19c675))


### Bug Fixes

* issue with commonjs exports ([#140](https://github.com/GetStream/stream-feeds-js/issues/140)) ([d8c60b5](https://github.com/GetStream/stream-feeds-js/commit/d8c60b5f284223c181e2ddf1ee651f6f86aa74f2))
* reset throttle state on disconnect user ([#139](https://github.com/GetStream/stream-feeds-js/issues/139)) ([c4406ef](https://github.com/GetStream/stream-feeds-js/commit/c4406ef65a3defd958d9ced3683e947575b5dae7))

## [0.2.18](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.17...@stream-io/feeds-client-0.2.18) (2025-10-14)


### Bug Fixes

* notification status not updated in some cases, reenable notifica… ([#136](https://github.com/GetStream/stream-feeds-js/issues/136)) ([367e34d](https://github.com/GetStream/stream-feeds-js/commit/367e34d2e1446a605986bdb389dbbe1dbe08bd40))
* story use-case fixes ([#137](https://github.com/GetStream/stream-feeds-js/issues/137)) ([bfe2a6f](https://github.com/GetStream/stream-feeds-js/commit/bfe2a6f7a83a785245a34a6c72e572cecd29c340))

## [0.2.17](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.16...@stream-io/feeds-client-0.2.17) (2025-10-09)


### Features

* add support for unique reactions ([#130](https://github.com/GetStream/stream-feeds-js/issues/130)) ([004722f](https://github.com/GetStream/stream-feeds-js/commit/004722f9b369f1e3757de9aaf41b17b24107832a))
* new aggregation format for notifications ([#131](https://github.com/GetStream/stream-feeds-js/issues/131)) ([318f5f5](https://github.com/GetStream/stream-feeds-js/commit/318f5f53b7a422c9815546de4a2af439565397b8))


### Bug Fixes

* Change response to FeedOwnCapability instead of string ([#135](https://github.com/GetStream/stream-feeds-js/issues/135)) ([c45b38a](https://github.com/GetStream/stream-feeds-js/commit/c45b38a1b638e1a208dc4e70abd5a130cf63f7e2))

## [0.2.16](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.15...@stream-io/feeds-client-0.2.16) (2025-10-07)


### Features

* New own_capabilities batch endpoint ([#134](https://github.com/GetStream/stream-feeds-js/issues/134)) ([973f297](https://github.com/GetStream/stream-feeds-js/commit/973f297d74e073ecde7f0acb64b14466b0fb4726))

## [0.2.15](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.14...@stream-io/feeds-client-0.2.15) (2025-10-02)


### Bug Fixes

* rename method ([#133](https://github.com/GetStream/stream-feeds-js/issues/133)) ([e471e2e](https://github.com/GetStream/stream-feeds-js/commit/e471e2ebb6efd82a563472087adc69755f4ef4b9))

## [0.2.14](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.13...@stream-io/feeds-client-0.2.14) (2025-10-02)


### Features

* stories feed implementation ([#132](https://github.com/GetStream/stream-feeds-js/issues/132)) ([99fac15](https://github.com/GetStream/stream-feeds-js/commit/99fac15fd256ec41750433a9e3d2fbb8744dc7aa))

## [0.2.13](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.12...@stream-io/feeds-client-0.2.13) (2025-09-30)


### Features

* allow pagination for feeds with aggregated activities ([#119](https://github.com/GetStream/stream-feeds-js/issues/119)) ([42a5522](https://github.com/GetStream/stream-feeds-js/commit/42a55224c7285d7758656ff3aa5b3a539dc85dfe))

## [0.2.12](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.11...@stream-io/feeds-client-0.2.12) (2025-09-24)


* **feeds-client:** enable verbatim module syntax ([#124](https://github.com/GetStream/stream-feeds-js/issues/124)) ([0a66d09](https://github.com/GetStream/stream-feeds-js/commit/0a66d09c4f7aca7e4d22f64616df95ea873838a4))


### Features

* support for new capabilities ([#128](https://github.com/GetStream/stream-feeds-js/issues/128)) ([ce76d92](https://github.com/GetStream/stream-feeds-js/commit/ce76d9232667ab54f4ef5f01819d09553bd52bf0))

## [0.2.11](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.10...@stream-io/feeds-client-0.2.11) (2025-09-22)


* force new release ([5139482](https://github.com/GetStream/stream-feeds-js/commit/5139482135ab45a23a0b9d72f15613786b63d927))

## [0.2.10](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.9...@stream-io/feeds-client-0.2.10) (2025-09-22)


### Features

* state updates on http responses for comments ([#120](https://github.com/GetStream/stream-feeds-js/issues/120)) ([2c45535](https://github.com/GetStream/stream-feeds-js/commit/2c455351815125d0537c01858e33185b829ca2ec))

## [0.2.9](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.8...@stream-io/feeds-client-0.2.9) (2025-09-18)


### Bug Fixes

* bump core packages and install shim ([#125](https://github.com/GetStream/stream-feeds-js/issues/125)) ([4659634](https://github.com/GetStream/stream-feeds-js/commit/4659634a49cd8dc6c0a04d9199e7eb3ea4e32d19))

## [0.2.8](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.7...@stream-io/feeds-client-0.2.8) (2025-09-17)


* update feeds API spec ([#122](https://github.com/GetStream/stream-feeds-js/issues/122)) ([a29c243](https://github.com/GetStream/stream-feeds-js/commit/a29c243d42d6c5da56b43e1d6091394f3db5419d))
* update filtering example in code snippets tests ([d05c730](https://github.com/GetStream/stream-feeds-js/commit/d05c730d8ce346e7b8ab7df4b4bc54a925e84308))


### Features

* configurable logging mechanism ([#108](https://github.com/GetStream/stream-feeds-js/issues/108)) ([c0fff26](https://github.com/GetStream/stream-feeds-js/commit/c0fff2668b037efd5dde35a288b45dde5e9f72c7))
* reaction state updates on http responses ([#118](https://github.com/GetStream/stream-feeds-js/issues/118)) ([181e150](https://github.com/GetStream/stream-feeds-js/commit/181e150cae97b32fc1264c2188e4ad3ef6b2c976))
* user agent and build revamp ([#121](https://github.com/GetStream/stream-feeds-js/issues/121)) ([c8009b0](https://github.com/GetStream/stream-feeds-js/commit/c8009b00820803e12539f39700787364c220e434))

## [0.2.7](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.6...@stream-io/feeds-client-0.2.7) (2025-09-10)


### Features

* Added user_count_truncated ([#112](https://github.com/GetStream/stream-feeds-js/issues/112)) ([827f222](https://github.com/GetStream/stream-feeds-js/commit/827f2222c8b63a822ea44f8718ec5b3a2cf67373))
* push config method ([#115](https://github.com/GetStream/stream-feeds-js/issues/115)) ([033441d](https://github.com/GetStream/stream-feeds-js/commit/033441d808215aa71396ebbea1b94222fd118a91))

## [0.2.6](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.5...@stream-io/feeds-client-0.2.6) (2025-09-09)


* [FEEDS-708] regenerate client from spec ([#116](https://github.com/GetStream/stream-feeds-js/issues/116)) ([a7e7edd](https://github.com/GetStream/stream-feeds-js/commit/a7e7edde50d37445cc85b051e7a6236f2ee92955))

## [0.2.5](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.4...@stream-io/feeds-client-0.2.5) (2025-09-08)


* add push code snippets to docs snippets tests ([#113](https://github.com/GetStream/stream-feeds-js/issues/113)) ([1f4f6ea](https://github.com/GetStream/stream-feeds-js/commit/1f4f6ead115d24e23bcde99e0dc20b3d85d696e3))


### Features

* add unhandled error events ([#109](https://github.com/GetStream/stream-feeds-js/issues/109)) ([2ac0cf3](https://github.com/GetStream/stream-feeds-js/commit/2ac0cf3adfa963348cf5602b462bda39487ffcaa))


### Bug Fixes

* update possibly stale feeds (`FeedsClient.queryFeeds`) ([#111](https://github.com/GetStream/stream-feeds-js/issues/111)) ([b1660e1](https://github.com/GetStream/stream-feeds-js/commit/b1660e1be4b24d01bb7cd26e11f27b2a46b746af))

## [0.2.4](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.3...@stream-io/feeds-client-0.2.4) (2025-09-04)


* fix docs snippets tests ([879d5d4](https://github.com/GetStream/stream-feeds-js/commit/879d5d48b70cb5ec16b82b145bf46abdb000c428))
* Skip notification tests to be able to release ([c71733e](https://github.com/GetStream/stream-feeds-js/commit/c71733e6e26ca65df1660452fd7ae73ef70f2e98))


### Features

* add TaskID in DeleteFeedResponse ([#107](https://github.com/GetStream/stream-feeds-js/issues/107)) ([153aa23](https://github.com/GetStream/stream-feeds-js/commit/153aa230e415fb20d790f083f0fb1057990e91f5))
* hashtags ([#105](https://github.com/GetStream/stream-feeds-js/issues/105)) ([f5e5e24](https://github.com/GetStream/stream-feeds-js/commit/f5e5e24be1183aab682cae05115f2c04f5543c4d))

## [0.2.3](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.2...@stream-io/feeds-client-0.2.3) (2025-09-01)


### Features

* add the ability to keep search items stable while searching ([#104](https://github.com/GetStream/stream-feeds-js/issues/104)) ([62a9808](https://github.com/GetStream/stream-feeds-js/commit/62a980890ce3a16e34a6d323ef8f58d58d2f8f4c))
* update to latest API spec ([#106](https://github.com/GetStream/stream-feeds-js/issues/106)) ([6555d15](https://github.com/GetStream/stream-feeds-js/commit/6555d15049fddace837cfd592bff2d18293a16be))

## [0.2.2](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.1...@stream-io/feeds-client-0.2.2) (2025-08-25)


### Features

* notification feed support ([#86](https://github.com/GetStream/stream-feeds-js/issues/86)) ([9ba245e](https://github.com/GetStream/stream-feeds-js/commit/9ba245e969c77f5c241fb4f5da93491ba87c3278))
* notification feeds ([#102](https://github.com/GetStream/stream-feeds-js/issues/102)) ([6822da8](https://github.com/GetStream/stream-feeds-js/commit/6822da8516ef83e66fd9b74f5497136ca51f8bda))

## [0.2.1](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.2.0...@stream-io/feeds-client-0.2.1) (2025-08-20)


### Features

* add membership_level in FeedMemberResponse ([#96](https://github.com/GetStream/stream-feeds-js/issues/96)) ([2aeeefa](https://github.com/GetStream/stream-feeds-js/commit/2aeeefa82abdc885dc52e9fe8249758042f9aed9))
* handle activity pinning ([#91](https://github.com/GetStream/stream-feeds-js/issues/91)) ([4347110](https://github.com/GetStream/stream-feeds-js/commit/4347110ce16c78f9e482d0c08e33dda0840678af))

## [0.2.0](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.11...@stream-io/feeds-client-0.2.0) (2025-08-18)


### ⚠ BREAKING CHANGES

* API naming review (#92)

### Features

* add `user.updated` handler ([#87](https://github.com/GetStream/stream-feeds-js/issues/87)) ([bc7778d](https://github.com/GetStream/stream-feeds-js/commit/bc7778d533fccbf30b1972e0114aa15e8dc97677))
* API naming review ([#92](https://github.com/GetStream/stream-feeds-js/issues/92)) ([2c12445](https://github.com/GetStream/stream-feeds-js/commit/2c124451a098e739e7dd803a3ca7923dacd07db3))


### Bug Fixes

* privatize watch handlers ([#85](https://github.com/GetStream/stream-feeds-js/issues/85)) ([ec8679d](https://github.com/GetStream/stream-feeds-js/commit/ec8679d6e5d4a0cc82200f7c1219c946921ae715)), closes [#83](https://github.com/GetStream/stream-feeds-js/issues/83)

## [0.1.11](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.10...@stream-io/feeds-client-0.1.11) (2025-08-01)


### Features

* add `feeds.follow.updated` handler & cleanup ([#83](https://github.com/GetStream/stream-feeds-js/issues/83)) ([9f296b8](https://github.com/GetStream/stream-feeds-js/commit/9f296b8cc195c34d6ac36eb53bf92ca8632e5dae))


### Bug Fixes

* real-time comment updates ([#79](https://github.com/GetStream/stream-feeds-js/issues/79)) ([afd485a](https://github.com/GetStream/stream-feeds-js/commit/afd485a489449985c157ce90da453a1e2dbc6fa3))
* update open API spec - unfollow HTTP response now contains follo… ([#81](https://github.com/GetStream/stream-feeds-js/issues/81)) ([0f27ef3](https://github.com/GetStream/stream-feeds-js/commit/0f27ef34e034e52bcdbaca9798b890f17e13fc00))

## [0.1.10](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.9...@stream-io/feeds-client-0.1.10) (2025-07-28)


### Features

* search implementation and bindings ([#78](https://github.com/GetStream/stream-feeds-js/issues/78)) ([02d7dd1](https://github.com/GetStream/stream-feeds-js/commit/02d7dd1fd1f01df411e92db328106987c366e4d4))

## [0.1.9](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.8...@stream-io/feeds-client-0.1.9) (2025-07-28)


### Features

* comments and activity actions ([#76](https://github.com/GetStream/stream-feeds-js/issues/76)) ([5484864](https://github.com/GetStream/stream-feeds-js/commit/54848641043c379e9c9b3d290260375dee5ccfa6))
* consider `depth` option for `loadNextPageComments` ([#65](https://github.com/GetStream/stream-feeds-js/issues/65)) ([5ffc786](https://github.com/GetStream/stream-feeds-js/commit/5ffc78626a8415f2c77d24d234810712b2f1e52c))
* enable queryFeeds without watch: true ([#75](https://github.com/GetStream/stream-feeds-js/issues/75)) ([fbd2851](https://github.com/GetStream/stream-feeds-js/commit/fbd285146fb4cec99711ec4fb18b22e5ae0847e6)), closes [/github.com/GetStream/stream-feeds-js/pull/75/files#diff-5fe26340feefe9212a93cb4f25c7996731c1245bb6253d4c106ef98afbcc3a17](https://github.com/GetStream//github.com/GetStream/stream-feeds-js/pull/75/files/issues/diff-5fe26340feefe9212a93cb4f25c7996731c1245bb6253d4c106ef98afbcc3a17) [/github.com/GetStream/stream-feeds-js/pull/75/files#diff-20886f4c7cbf4a14b78ed974d55bb6d44f278117f37d1864e494443c3ee8f73dR30](https://github.com/GetStream//github.com/GetStream/stream-feeds-js/pull/75/files/issues/diff-20886f4c7cbf4a14b78ed974d55bb6d44f278117f37d1864e494443c3ee8f73dR30)


### Bug Fixes

* adjust how we merge/update members ([#74](https://github.com/GetStream/stream-feeds-js/issues/74)) ([220aa07](https://github.com/GetStream/stream-feeds-js/commit/220aa07868bd56637c37f4b1434020ae548b5a9b))
* catch irrelevant error to avoid test failiure ([#77](https://github.com/GetStream/stream-feeds-js/issues/77)) ([836a8bb](https://github.com/GetStream/stream-feeds-js/commit/836a8bbb58d4d0fe150f4c370d0a05dcc26252cb))

## [0.1.8](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.7...@stream-io/feeds-client-0.1.8) (2025-07-23)


* [FEEDS-538] bump openapi to support notifcation event ([#73](https://github.com/GetStream/stream-feeds-js/issues/73)) ([6829746](https://github.com/GetStream/stream-feeds-js/commit/6829746dd64ac171e17133c1d1a44161346cc17b))

## [0.1.7](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.6...@stream-io/feeds-client-0.1.7) (2025-07-22)


* increase timeouts ([55e77db](https://github.com/GetStream/stream-feeds-js/commit/55e77db1be59e6a03fcd1908db584c1c2102bbca))


### Features

* [FEEDS-588]add stopWatchingFeed endpoint ([#72](https://github.com/GetStream/stream-feeds-js/issues/72)) ([f9a7b87](https://github.com/GetStream/stream-feeds-js/commit/f9a7b87c4c9da08582941f489ee18d22e25cf81a))

## [0.1.6](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.5...@stream-io/feeds-client-0.1.6) (2025-07-22)


* Run tests on CI ([#68](https://github.com/GetStream/stream-feeds-js/issues/68)) ([89b0a4b](https://github.com/GetStream/stream-feeds-js/commit/89b0a4bbce14af563380c17c73188e7e6f688e65))


### Features

* following and user screens ([#71](https://github.com/GetStream/stream-feeds-js/issues/71)) ([7123f0a](https://github.com/GetStream/stream-feeds-js/commit/7123f0a2472ca59da697326e99253ebcbc7db147))


### Bug Fixes

* bookmark is identified by activity id and folder id ([#70](https://github.com/GetStream/stream-feeds-js/issues/70)) ([97ee937](https://github.com/GetStream/stream-feeds-js/commit/97ee937a951de0d76ebf88a6083d3c67d4cef762))

## [0.1.5](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.4...@stream-io/feeds-client-0.1.5) (2025-07-18)


### Features

* add loadNextPage to useComments ([#57](https://github.com/GetStream/stream-feeds-js/issues/57)) ([fef823c](https://github.com/GetStream/stream-feeds-js/commit/fef823ceeb1d181f44607821cb46ec2458e199f3))
* add loadNextPageMembers ([#56](https://github.com/GetStream/stream-feeds-js/issues/56)) ([104dad0](https://github.com/GetStream/stream-feeds-js/commit/104dad0c1440ad26b41b76e1402ef0635e4358ac))
* add useFollowers & useFollowing ([#55](https://github.com/GetStream/stream-feeds-js/issues/55)) ([95bef04](https://github.com/GetStream/stream-feeds-js/commit/95bef04d2d921574fd1461cca0965963bc245910))
* feed context, file uploads and reactions ([#66](https://github.com/GetStream/stream-feeds-js/issues/66)) ([886123a](https://github.com/GetStream/stream-feeds-js/commit/886123aeb243c04d9ae82112634e826518e61089))


### Bug Fixes

* post useComments/useFollows merge fixes ([#64](https://github.com/GetStream/stream-feeds-js/issues/64)) ([2da2670](https://github.com/GetStream/stream-feeds-js/commit/2da2670d9575aba8b3f22d4cc019ae911a92edfb))
* replace `eol` with `checkHasAnotherPage` ([#67](https://github.com/GetStream/stream-feeds-js/issues/67)) ([f490e1f](https://github.com/GetStream/stream-feeds-js/commit/f490e1f16775adac46bccc979d5d0d2ce825f859))

## [0.1.4](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.3...@stream-io/feeds-client-0.1.4) (2025-07-16)


* update to latest openapi ([#62](https://github.com/GetStream/stream-feeds-js/issues/62)) ([82b39ae](https://github.com/GetStream/stream-feeds-js/commit/82b39aee0c62cd9aa1598fb42aaf6637ded83a33))

## [0.1.3](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.2...@stream-io/feeds-client-0.1.3) (2025-07-15)


### Features

* reconcile watched feeds on reconnect ([#54](https://github.com/GetStream/stream-feeds-js/issues/54)) ([b00e7c7](https://github.com/GetStream/stream-feeds-js/commit/b00e7c775a7680a93ff3180944e8e340e155c55e))


### Bug Fixes

* form data undefined values ([#60](https://github.com/GetStream/stream-feeds-js/issues/60)) ([ef8c2f2](https://github.com/GetStream/stream-feeds-js/commit/ef8c2f29b53b24d291531edb1621e39650bf6109))
* remove timeout for file uploads ([#58](https://github.com/GetStream/stream-feeds-js/issues/58)) ([56a3d7d](https://github.com/GetStream/stream-feeds-js/commit/56a3d7d8afa55fb4dedffb97b22a3863e746d13e))

## [0.1.2](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.1...@stream-io/feeds-client-0.1.2) (2025-07-11)


* run CI actions on PRs for main, and on main ([#47](https://github.com/GetStream/stream-feeds-js/issues/47)) ([1a2c35b](https://github.com/GetStream/stream-feeds-js/commit/1a2c35bb1425d6e9f897a153024fdafce7a5e9df))
* Run tests on Node ([#50](https://github.com/GetStream/stream-feeds-js/issues/50)) ([8669bd6](https://github.com/GetStream/stream-feeds-js/commit/8669bd60be696fb40c77d5ba180c605edb660df4))


### Features

* client creation hooks, StreamFeeds wrapper, contexts ([#49](https://github.com/GetStream/stream-feeds-js/issues/49)) ([f5c6059](https://github.com/GetStream/stream-feeds-js/commit/f5c6059e83e0cd1a0ca142d5a4d9871c53b0e88d))
* **gen:** bookmark folder stuff ([#51](https://github.com/GetStream/stream-feeds-js/issues/51)) ([eb5c5be](https://github.com/GetStream/stream-feeds-js/commit/eb5c5be1ce3302e74b0ebaf76d7050f93056d413))
* Update to latest open API spec ([#53](https://github.com/GetStream/stream-feeds-js/issues/53)) ([e7c3f49](https://github.com/GetStream/stream-feeds-js/commit/e7c3f49f12ed19c522dede04dfa8fea8a6cf1d05))


### Bug Fixes

* update source feed on `feeds.follow.created` ([#52](https://github.com/GetStream/stream-feeds-js/issues/52)) ([e2bed97](https://github.com/GetStream/stream-feeds-js/commit/e2bed97d3b3e8b106e193d2d435468e5654c7381))

## [0.1.1](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.1.0...@stream-io/feeds-client-0.1.1) (2025-07-09)


### Features

* add useOwnCapabilities hook ([#42](https://github.com/GetStream/stream-feeds-js/issues/42)) ([cc98328](https://github.com/GetStream/stream-feeds-js/commit/cc98328d434ee1306c0d8d5d7d236626f6481431))


### Bug Fixes

* Handle missing properties in comment reaction WS event, Simplify reaction handling, fix JS tests ([#43](https://github.com/GetStream/stream-feeds-js/issues/43)) ([356e90b](https://github.com/GetStream/stream-feeds-js/commit/356e90bfd4199a7ef44c88de820f11bb52851e47))
* lint issues ([3b87041](https://github.com/GetStream/stream-feeds-js/commit/3b870418018173ef38389dd6b7b05bbf33499c78))

## [0.1.0](https://github.com/GetStream/stream-feeds-js/compare/@stream-io/feeds-client-0.0.0...@stream-io/feeds-client-0.1.0) (2025-07-08)


### ⚠ BREAKING CHANGES

* simulate breaking change in llc
* test breaking change

* **@stream-io/feeds-client:** release version 0.1.0 ([b3232e0](https://github.com/GetStream/stream-feeds-js/commit/b3232e02fde10a8278e540660cfec612c0faec80))
* **@stream-io/feeds-client:** release version 0.1.1 ([8705f23](https://github.com/GetStream/stream-feeds-js/commit/8705f23db22b559b0f03a9b12fd946ae8d952c3c))
* **@stream-io/feeds-client:** release version 0.1.2 ([911a189](https://github.com/GetStream/stream-feeds-js/commit/911a1892f562af8f3b78f50a32eed7e3bc06a0cc))
* **@stream-io/feeds-client:** release version 0.2.0 ([26f0976](https://github.com/GetStream/stream-feeds-js/commit/26f0976dedbbd40fc416104fd80c15c012b007b4))
* clean up changelogs before releasing ([#40](https://github.com/GetStream/stream-feeds-js/issues/40)) ([4ef805f](https://github.com/GetStream/stream-feeds-js/commit/4ef805f901a3251d053eed1147108de86ab195df))
* ESLint + new OpenAPI generated files ([#32](https://github.com/GetStream/stream-feeds-js/issues/32)) ([b600795](https://github.com/GetStream/stream-feeds-js/commit/b600795f29524acd924d31244d4abeb6fb0520b8))
* Prepare package.json for release ([#37](https://github.com/GetStream/stream-feeds-js/issues/37)) ([348475a](https://github.com/GetStream/stream-feeds-js/commit/348475a2ebec7acb3faef3649f8cb420b3c3b2eb))


### Features

* add feeds.feed_member.* handlers ([#22](https://github.com/GetStream/stream-feeds-js/issues/22)) ([956bf67](https://github.com/GetStream/stream-feeds-js/commit/956bf6794c70aab78fa82b8f2103e77c6800b618))
* dummy client change ([0a32a8e](https://github.com/GetStream/stream-feeds-js/commit/0a32a8e0d657f51424e9db16e852cdc26524175e))
* enable npm publishing for LLC ([e1c9443](https://github.com/GetStream/stream-feeds-js/commit/e1c9443cd3d7a9fe0003d2ebd1ec94db18c2dd62))
* react bindings ([#38](https://github.com/GetStream/stream-feeds-js/issues/38)) ([c9c318f](https://github.com/GetStream/stream-feeds-js/commit/c9c318f289dff1f4b5aeceba4c3e0685f458aa47))
* simulate breaking change in llc ([fd9b2cf](https://github.com/GetStream/stream-feeds-js/commit/fd9b2cf858a5073571a0ad4cd7d3df329f845622))
* support bookmark events ([#35](https://github.com/GetStream/stream-feeds-js/issues/35)) ([a582107](https://github.com/GetStream/stream-feeds-js/commit/a5821074dc2aa977a7b10276a69da6c6c3dbfe3c))


### Bug Fixes

* change back to conventional commits ([f633b6e](https://github.com/GetStream/stream-feeds-js/commit/f633b6e929dbb8459e5ceb57d195d478fe1af818))
* follows upgrades ([#15](https://github.com/GetStream/stream-feeds-js/issues/15)) ([5c42d1c](https://github.com/GetStream/stream-feeds-js/commit/5c42d1c7838517d0d43c5db8c65d0ff9d274b8b3))
* lint issues continuation ([9b55a23](https://github.com/GetStream/stream-feeds-js/commit/9b55a23bc3c9a60001f17fb7c0ef81389db11cfb))
* lint issues during build ([ceac228](https://github.com/GetStream/stream-feeds-js/commit/ceac2282e2802f9c8345cfe707caad511dbe329d))
* remove dryrun ([13c70c7](https://github.com/GetStream/stream-feeds-js/commit/13c70c75b179d4fcef407f5bc7c44e32d82c89e6))
* switch to jscutlery for more fine grained control ([#33](https://github.com/GetStream/stream-feeds-js/issues/33)) ([9e47da8](https://github.com/GetStream/stream-feeds-js/commit/9e47da8fc8dfb4da7fc9b76a26a54185b447b7e4))
* test breaking change ([95dee5f](https://github.com/GetStream/stream-feeds-js/commit/95dee5fcc46d3e9c738c1d8aae9268e4784aa8ae))
* try with a fix commit too ([ec191a3](https://github.com/GetStream/stream-feeds-js/commit/ec191a374c0632021e7d1ec81f5c1bdca00daac4))
* try with angular but without prerelease ([2ecd8bb](https://github.com/GetStream/stream-feeds-js/commit/2ecd8bb12bc4e9ab0cb00671adcd2ac1861cb2ec))
* try with angular commit ([b1d9237](https://github.com/GetStream/stream-feeds-js/commit/b1d923742189f309b2b3fffd65361abff0e8fdc2))
* try with conventional commits again ([cd417ec](https://github.com/GetStream/stream-feeds-js/commit/cd417ec6dc0d16650efa4c69f1873d6c5af02e00))
