# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

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
