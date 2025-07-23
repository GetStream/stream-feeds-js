# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

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
