const {
  withProjectBuildGradle,
  withSettingsGradle,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@expo/config-plugins');

const REPO_LINES = [
  // add more here if needed
  'maven { url file("$rootDir/../../../../node_modules/@notifee/react-native/android/libs") }',
];

function hasNotifeeRepo(src) {
  return src.includes('@notifee/react-native/android/libs');
}

function injectIntoSettingsGradle(src) {
  if (hasNotifeeRepo(src)) return src;

  const drmBlockMatch = src.match(
    /dependencyResolutionManagement\s*\{[\s\S]*?repositories\s*\{[\s\S]*?\}[\s\S]*?\}/
  );

  if (drmBlockMatch) {
    return src.replace(
      /repositories\s*\{/,
      (m) => `${m}\n        ${REPO_LINES.join('\n        ')}\n`
    );
  }

  const block = `
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        ${REPO_LINES.join('\n        ')}
        google()
        mavenCentral()
    }
}
`;
  return `${src.trim()}\n\n${block}`;
}

function injectIntoBuildGradle(src) {
  if (hasNotifeeRepo(src)) return src;

  const INSERT = `\n        ${REPO_LINES.join('\n        ')}\n`;

  // 1) allprojects { repositories { ... } }
  const reAllProjects = /(allprojects\s*\{[\s\S]*?repositories\s*\{)/m;
  if (reAllProjects.test(src)) {
    return src.replace(reAllProjects, (m) => m + INSERT);
  }

  // 2) subprojects { repositories { ... } }
  const reSubProjects = /(subprojects\s*\{[\s\S]*?repositories\s*\{)/m;
  if (reSubProjects.test(src)) {
    return src.replace(reSubProjects, (m) => m + INSERT);
  }

  // 3) top-level repositories { ... } (project-level)
  const reTopLevel = /(^|\n)\s*repositories\s*\{/m;
  if (reTopLevel.test(src)) {
    return src.replace(reTopLevel, (m) => m + INSERT);
  }

  // 4) fallback: append a standard block
  const block = `
allprojects {
    repositories {
        ${REPO_LINES.join('\n        ')}
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
`;
  return `${src.trim()}\n\n${block}`;
}

module.exports = function withNotifeeMaven(config) {
  // config = withSettingsGradle(config, (c) => {
  //   c.modResults.contents = injectIntoSettingsGradle(c.modResults.contents);
  //   return c;
  // });

  config = withProjectBuildGradle(config, (c) => {
    c.modResults.contents = injectIntoBuildGradle(c.modResults.contents);
    return c;
  });

  return config;
};
