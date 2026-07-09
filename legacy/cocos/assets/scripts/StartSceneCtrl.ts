/**
 * 生肖天机 - 起始场景控制器
 * 选择属相和命格，创建角色
 */

import { _decorator, Node, Label, Button, Sprite, EventHandler } from 'cc';
import { GM } from './GameManager';
import { ZODIAC_NAMES, ZODIAC_EMOJIS, FATE_NAMES, FATE_EMOJIS, FATE_COLORS, FATE_DESCS } from './Constants';

const { ccclass, property } = _decorator;

@ccclass('StartSceneCtrl')
export class StartSceneCtrl {
    private _selectedZodiac: number = -1;
    private _selectedFate: number = -1;
    private _zodiacNodes: Map<number, Node> = new Map();
    private _fateNodes: Map<number, Node> = new Map();

    /** Cocos启动时调用 */
    start(): void {
        this.createZodiacGrid();
        this.createFateList();
        this.bindStartButton();
        console.log('[StartSceneCtrl] 起始场景初始化完成');
    }

    // ============== 属相选择 ==============

    private createZodiacGrid(): void {
        const grid = new Node('ZodiacGrid');

        // 4列3行布局
        for (let i = 0; i < 12; i++) {
            const node = new Node('Zodiac_' + i);
            node.setPosition(-150 + (i % 4) * 100, 100 - Math.floor(i / 4) * 120, 0);

            // 背景
            const bg = node.addComponent(Sprite);
            bg.color = { r: 60, g: 60, b: 80, a: 255 };

            // 属相标签（emoji）
            const label = node.addComponent(Label);
            label.string = ZODIAC_EMOJIS[i];
            label.fontSize = 40;
            label.horizontalAlign = 1;
            label.verticalAlign = 1;

            // 点击事件
            node.on(Node.EventType.TOUCH_END, () => this.onZodiacSelected(i));

            grid.addChild(node);
            this._zodiacNodes.set(i, node);
        }

        // grid.parent = find('Canvas/ZodiacSection');
    }

    private onZodiacSelected(index: number): void {
        // 取消之前的选中
        if (this._selectedZodiac >= 0) {
            const prev = this._zodiacNodes.get(this._selectedZodiac);
            if (prev) {
                const sp = prev.getComponent(Sprite);
                if (sp) sp.color = { r: 60, g: 60, b: 80, a: 255 };
            }
        }

        // 高亮选中
        this._selectedZodiac = index;
        const node = this._zodiacNodes.get(index);
        if (node) {
            const sp = node.getComponent(Sprite);
            if (sp) sp.color = { r: 255, g: 200, b: 0, a: 255 };
        }

        console.log(`[StartSceneCtrl] 选中属相：${ZODIAC_NAMES[index]} ${ZODIAC_EMOJIS[index]}`);

        this.checkCanStart();
    }

    // ============== 命格选择 ==============

    private createFateList(): void {
        const list = new Node('FateList');

        for (let i = 0; i < 5; i++) {
            const node = new Node('Fate_' + i);
            node.setPosition(0, 150 - i * 80, 0);

            // 背景
            const bg = node.addComponent(Sprite);
            bg.color = { r: 40, g: 40, b: 60, a: 255 };

            // 命格名
            const nameLabel = node.addComponent(Label);
            nameLabel.string = `${FATE_EMOJIS[i]} ${FATE_NAMES[i]}命`;
            nameLabel.fontSize = 28;
            nameLabel.color = FATE_COLORS[i];

            // 描述
            const descLabel = new Node('Desc');
            descLabel.parent = node;
            const descL = descLabel.addComponent(Label);
            descL.string = FATE_DESCS[i];
            descL.fontSize = 18;
            descL.color = { r: 180, g: 180, b: 180, a: 255 };
            descL.setPosition(0, -25, 0);

            // 点击事件
            node.on(Node.EventType.TOUCH_END, () => this.onFateSelected(i));

            list.addChild(node);
            this._fateNodes.set(i, node);
        }

        // list.parent = find('Canvas/FateSection');
    }

    private onFateSelected(index: number): void {
        // 取消之前的选中
        if (this._selectedFate >= 0) {
            const prev = this._fateNodes.get(this._selectedFate);
            if (prev) {
                const sp = prev.getComponent(Sprite);
                if (sp) sp.color = { r: 40, g: 40, b: 60, a: 255 };
            }
        }

        // 高亮选中
        this._selectedFate = index;
        const node = this._fateNodes.get(index);
        if (node) {
            const sp = node.getComponent(Sprite);
            if (sp) sp.color = { r: 80, g: 80, b: 120, a: 255 };
        }

        console.log(`[StartSceneCtrl] 选中命格：${FATE_NAMES[index]} ${FATE_EMOJIS[index]}`);

        this.checkCanStart();
    }

    // ============== 开始按钮 ==============

    private bindStartButton(): void {
        // const startBtn = find('Canvas/StartButton')?.getComponent(Button);
        // if (startBtn) {
        //     const handler = new EventHandler();
        //     handler.target = this.node;
        //     handler.component = 'StartSceneCtrl';
        //     handler.handler = 'onStartClicked';
        //     startBtn.clickEvents.push(handler);
        // }
    }

    private checkCanStart(): void {
        // 更新开始按钮状态
        // const startBtn = find('Canvas/StartButton');
        // if (startBtn) {
        //     const btn = startBtn.getComponent(Button);
        //     if (btn) {
        //         btn.interactable = this._selectedZodiac >= 0 && this._selectedFate >= 0;
        //     }
        // }
    }

    private onStartClicked(): void {
        if (this._selectedZodiac < 0 || this._selectedFate < 0) {
            console.log('[StartSceneCtrl] 还没选完属相和命格');
            return;
        }

        // 创建角色
        GM.createCharacter(this._selectedZodiac, this._selectedFate);

        // 切换到主场景
        // Director.getInstance().loadScene('MainScene');

        console.log(`[StartSceneCtrl] 开始游戏：属相${ZODIAC_NAMES[this._selectedZodiac]}，命格${FATE_NAMES[this._selectedFate]}`);
    }
}