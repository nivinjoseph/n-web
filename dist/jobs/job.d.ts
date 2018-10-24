export interface Job {
    run(): Promise<void>;
    dispose(): Promise<void>;
}
