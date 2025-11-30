import { BlockStatement } from "./vjass-ast";

export class CommonJProgram extends BlockStatement {

}
export class BlizzardJProgram extends BlockStatement {

}
export class CommonAiProgram extends BlockStatement {

}
export class Program extends BlockStatement {
    private readonly commonJProgram?: CommonJProgram;
    private readonly blizzardJProgram?: BlizzardJProgram;
    private readonly commonAiProgram?: CommonAiProgram;

    constructor(commonJProgram?: CommonJProgram, blizzardJProgram?: BlizzardJProgram, commonAiProgram?: CommonAiProgram) {
        super();
        this.commonJProgram = commonJProgram;
        this.blizzardJProgram = blizzardJProgram;
        this.commonAiProgram = commonAiProgram;
    }
}
