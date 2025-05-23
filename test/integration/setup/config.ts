import { expect } from "chai";

import { extendConfig } from "hardhat/config";

import { useEnvironment } from "../../helpers";

import { zkitConfigExtender } from "@src/config/config";

import { ZKitConfig } from "@src/types/zkit-config";

describe("config", () => {
  describe("loading", () => {
    useEnvironment({ fixtureProjectName: "defined-config" });

    let loadedOptions: ZKitConfig;

    beforeEach(async function () {
      loadedOptions = this.hre.config.zkit;
    });

    it("should apply user defined config", async () => {
      const userDefinedConfig: ZKitConfig = {
        compilerVersion: "2.1.8",
        circuitsDir: "circuits",
        compilationSettings: {
          artifactsDir: "zkit/artifacts",
          onlyFiles: [],
          skipFiles: ["vendor"],
          c: false,
          json: false,
          optimization: "O2",
        },
        setupSettings: {
          contributionSettings: {
            provingSystem: "groth16",
            contributions: 2,
          },
          ptauDir: "zkit/ptau",
          ptauDownload: true,
          onlyFiles: [],
          skipFiles: [],
        },
        verifiersSettings: {
          verifiersDir: "contracts/verifiers",
          verifiersType: "vy",
        },
        typesDir: "generated-types/zkit",
        typesWitnessLimit: 50000,
        quiet: true,
      };

      expect(loadedOptions).to.deep.equal(userDefinedConfig);
    });
  });

  describe("extension", () => {
    useEnvironment({ fixtureProjectName: "undefined-config" });

    let loadedOptions: ZKitConfig;

    beforeEach("setup", async function () {
      extendConfig(zkitConfigExtender);
      loadedOptions = this.hre.config.zkit;
    });

    it("the zkit field should be present", async () => {
      const defaultConfig: ZKitConfig = {
        compilerVersion: undefined,
        circuitsDir: "circuits",
        compilationSettings: {
          artifactsDir: "zkit/artifacts",
          onlyFiles: [],
          skipFiles: [],
          c: false,
          json: false,
          optimization: "O1",
        },
        setupSettings: {
          contributionSettings: {
            provingSystem: "groth16",
            contributions: 2,
          },
          ptauDir: undefined,
          ptauDownload: true,
          onlyFiles: [],
          skipFiles: [],
        },
        verifiersSettings: {
          verifiersDir: "contracts/verifiers",
          verifiersType: "sol",
        },
        typesDir: "generated-types/zkit",
        typesWitnessLimit: 50000,
        quiet: false,
      };

      expect(loadedOptions).to.deep.equal(defaultConfig);
    });
  });
});
