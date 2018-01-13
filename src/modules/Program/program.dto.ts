export class ProgramDto {
    readonly created: number;
    readonly description: string;
    readonly details: string;
    readonly externalLink: string;
    readonly guid: string;
    readonly tags: string[];
    readonly title: string;

    constructor(data) {
        Object.assign(this, data);

        if (!this.hasOwnProperty('created') || typeof this.created !== "number") {
            throw new Error("bad ProgramDto");
        }
    }
}