import { window, Event, EventEmitter, TreeDataProvider } from 'vscode'
import { getChapter, getLocalBooks } from './utils'
import NovelTreeItem from './NovelTreeItem'
import OnlineTreeItem from './OnlineTreeItem'
export default class DataProvider implements TreeDataProvider<Novel> {

    public refreshEvent: EventEmitter<Novel | null> = new EventEmitter<Novel | null>()

    readonly onDidChangeTreeData: Event<Novel | null> = this.refreshEvent.event

    // 判断列表是本地还是在线
    public isOnline = false;

    public treeNode: Novel[] = [];

    private localNovelsPath: string;

    constructor(localNovelsPath: string) {
        
        this.localNovelsPath = localNovelsPath;

        getLocalBooks(localNovelsPath).then((res) => {
            this.treeNode = res;
        }).catch((e) => {
            window.showInformationMessage(e);
        })
    }

    refresh(isOnline: boolean) {
        this.isOnline = isOnline;
        if (!this.isOnline) {
            getLocalBooks(this.localNovelsPath).then((res) => {
                this.treeNode = res;
                this.refreshEvent.fire(null)
            }).catch((e) => {
                window.showInformationMessage(e);
            })
        }
        this.refreshEvent.fire(null)
    }

    public fire(): void {
        this.refreshEvent.fire(null);
    }

    getTreeItem(info: Novel): NovelTreeItem {
        
        if (this.isOnline) return new OnlineTreeItem(info);

        return new NovelTreeItem(info)
    }

    async getChildren(element?: Novel | undefined): Promise<Novel[]> {
        // console.log('element',element);
        if (element) {
            return await getChapter(element.path);
        }
        return this.treeNode
    }

}
