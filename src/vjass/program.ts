import { BlockStatement } from "./ast";

export class CommonJProgram extends BlockStatement {

}
export class BlizzardJProgram extends BlockStatement {

}
export class CommonAiProgram extends BlockStatement {

}
export class DzAPIJProgram extends BlockStatement {

}
export class war3mapJProgram extends BlockStatement {

}
export class AIScriptsAiProgram extends BlockStatement {

}
export class CheatsJProgram extends BlockStatement {

}
export class InitCheatsJProgram extends BlockStatement {

}
export class Program extends BlockStatement {
    private readonly commonJProgram?: CommonJProgram;
    private readonly blizzardJProgram?: BlizzardJProgram;
    private readonly commonAiProgram?: CommonAiProgram;
    private readonly DzAPIJProgram?: DzAPIJProgram;
    private readonly war3mapJProgram?: war3mapJProgram;
    private readonly AIScriptsAiProgram?: AIScriptsAiProgram;
    private readonly CheatsJProgram?: CheatsJProgram;
    private readonly InitCheatsJProgram?: InitCheatsJProgram;

    constructor(commonJProgram?: CommonJProgram, blizzardJProgram?: BlizzardJProgram, commonAiProgram?: CommonAiProgram,
                DzAPIJProgram?: DzAPIJProgram, war3mapJProgram?: war3mapJProgram, AIScriptsAiProgram?: AIScriptsAiProgram,
                CheatsJProgram?: CheatsJProgram, InitCheatsJProgram?: InitCheatsJProgram)
    {
        super();
        this.commonJProgram = commonJProgram;
        this.blizzardJProgram = blizzardJProgram;
        this.commonAiProgram = commonAiProgram;
        this.DzAPIJProgram = DzAPIJProgram;
        this.war3mapJProgram = war3mapJProgram;
        this.AIScriptsAiProgram = AIScriptsAiProgram;
        this.CheatsJProgram = CheatsJProgram;
        this.InitCheatsJProgram = InitCheatsJProgram;
    }
}
