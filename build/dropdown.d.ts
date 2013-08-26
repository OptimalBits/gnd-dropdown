declare class SelectOption extends Gnd.Model {
}
declare class DropDown extends Gnd.View {
    private selectingId;
    private selectedId;
    private selectedItem;
    private viewModel;
    private selectOptions;
    private opts;
    constructor(collection: Gnd.Collection, opts);
    public destroy(): void;
    public render(context?: {}): Gnd.Promise<HTMLElement>;
    public activate(el?): void;
    public deactivate(el?): void;
    public selectItem(item: Gnd.Model): void;
    public selectHandler(el): void;
    public selectById(id): void;
}
