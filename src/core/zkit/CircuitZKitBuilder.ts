import { HardhatRuntimeEnvironment } from "hardhat/types";
import { willRunWithTypescript } from "hardhat/internal/core/typescript-support";

import {
  CircuitZKit,
  CircuitZKitConfig,
  Groth16Implementer,
  IProtocolImplementer,
  PlonkImplementer,
  ProvingSystemType,
} from "@solarity/zkit";
import { CircuitTypesGenerator } from "@solarity/zktype";

import { HardhatZKitError } from "../../errors";
import { getNormalizedFullPath, getUniqueProvingSystems } from "../../utils";

import { ICircuitZKitBuilder } from "../../types/core";
import { CircuitArtifact } from "../../types/artifacts/circuit-artifacts";

export class CircuitZKitBuilder implements ICircuitZKitBuilder {
  private readonly _isTSProject: boolean;
  private readonly _typesGenerator: CircuitTypesGenerator;
  private readonly _provingSystems: ProvingSystemType[];
  private _protocolImplementers = new Map<ProvingSystemType, IProtocolImplementer<ProvingSystemType>>();

  constructor(private readonly _hre: HardhatRuntimeEnvironment) {
    this._typesGenerator = new CircuitTypesGenerator({
      basePath: _hre.config.zkit.circuitsDir,
      projectRoot: _hre.config.paths.root,
      outputTypesDir: _hre.config.zkit.typesDir,
      circuitsArtifacts: [],
    });

    this._isTSProject = willRunWithTypescript(_hre.hardhatArguments.config);
    this._provingSystems = getUniqueProvingSystems(_hre.config.zkit.setupSettings.contributionSettings.provingSystem);
  }

  public async getCircuitZKit(
    circuitName: string,
    provingSystem?: ProvingSystemType,
    verifiersDir?: string,
  ): Promise<CircuitZKit<ProvingSystemType>> {
    const circuitArtifact: CircuitArtifact = await this._hre.zkit.circuitArtifacts.readCircuitArtifact(circuitName);
    const circuitZKitConfig: CircuitZKitConfig = this._getCircuitZKitConfig(circuitArtifact, verifiersDir);

    /// If multiple proving systems are available but none is explicitly specified, throw an error
    if (this._provingSystems.length > 1 && !provingSystem) {
      throw new HardhatZKitError(
        "Found several proving systems. Please specify the exact proving system in the getCircuit function.",
      );
    }

    // If a proving system is specified but not found in the available proving systems, throw an error
    if (provingSystem && !this._provingSystems.includes(provingSystem)) {
      throw new HardhatZKitError(
        "Invalid proving system is passed. Please recompile the circuits or change the proving system.",
      );
    }

    if (this._isTSProject) {
      // If only a single proving system has been configured, undefined should be used to retrieve the zktype type
      if (this._provingSystems.length === 1 && provingSystem) {
        provingSystem = undefined;
      }

      const module = await this._typesGenerator.getCircuitObject(circuitName, provingSystem);

      return new module(circuitZKitConfig);
    } else {
      // If a proving system was not explicitly provided, it will be retrieved from the config
      if (!provingSystem) {
        provingSystem = this._provingSystems[0];
      }

      return new CircuitZKit<typeof provingSystem>(circuitZKitConfig, this.getProtocolImplementer(provingSystem));
    }
  }

  public getProtocolImplementer(provingSystem: ProvingSystemType): IProtocolImplementer<typeof provingSystem> {
    if (!this._protocolImplementers.has(provingSystem)) {
      switch (provingSystem) {
        case "groth16":
          this._protocolImplementers.set(provingSystem, new Groth16Implementer());
          break;
        case "plonk":
          this._protocolImplementers.set(provingSystem, new PlonkImplementer());
          break;
        default:
          throw new HardhatZKitError(`Unsupported proving system - ${provingSystem}`);
      }
    }

    return this._protocolImplementers.get(provingSystem)!;
  }

  private _getCircuitZKitConfig(circuitArtifact: CircuitArtifact, verifiersDir: string | undefined): CircuitZKitConfig {
    const verifiersDirFullPath: string = getNormalizedFullPath(
      this._hre.config.paths.root,
      verifiersDir ?? this._hre.config.zkit.verifiersSettings.verifiersDir,
    );

    const circuitArtifactsDirPath: string = getNormalizedFullPath(
      this._hre.zkit.circuitArtifacts.getCircuitArtifactsDirFullPath(),
      circuitArtifact.circuitSourceName,
    );

    return {
      circuitName: circuitArtifact.circuitTemplateName,
      circuitArtifactsPath: circuitArtifactsDirPath,
      verifierDirPath: verifiersDirFullPath,
    };
  }
}
