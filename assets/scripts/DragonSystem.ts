/**
 * 生肖天机 - 灵兽节点管理
 * 负责 Cocos 场景中灵兽节点的创建、销毁、拖拽
 * 注意：存档数据由 SaveSystem 管理，本模块只管 Cocos 节点
 */

import { _decorator, Node, Sprite, Label, tween, Vec3, UITransform, Color } from 'cc';
import { ZODIAC_EMOJIS, LEVEL_NAMES } from './Constants';
import type { DragonData } from './Types';

const { ccclass, property } = _decorator;

@ccclass('DragonSystem')
export class DragonSystem {
    /** 灵兽颜色渐变表 */
    private static readonly LEVEL_COLORS: [number, number, number][] = [
        [200, 200, 200],  // Lv1 灰
        [100, 200, 100],  // Lv2 绿
        [100, 180, 255],  // Lv3 蓝
        [255, 200, 100],  // Lv4 黄
        [255, 150, 100],  // Lv5 橙
        [255, 100, 100],  // Lv6 红
        [255, 100, 200],  // Lv7 粉
        [200, 100, 255],  // Lv8 紫
        [100, 100, 255],  // Lv9 深蓝
        [255, 255, 100],  // Lv10 金黄
        [255, 200, 50],   // Lv11 亮金
        [255, 150, 0],    // Lv12 橙金
        [255, 100, 50],   // Lv13 红金
        [200, 50, 50],    // Lv14 深红
        [255, 215, 0],    // Lv15 金色（鸿蒙）
    ];

    private static readonly NODE_SIZE = 80; // 灵兽节点大小

    /**
     * 创建灵兽 Cocos 节点
     */
    public static createDragonNode(dragon: DragonData, parent: Node): Node {
        const node = new Node(`Dragon_${dragon.id}`);
        node.setPosition(dragon.posX, dragon.posY, 0);

        // 背景圆
        const sprite = node.addComponent(Sprite);
        const [r, g, b] = this.LEVEL_COLORS[Math.min(dragon.level - 1, this.LEVEL_COLORS.length - 1)];
        sprite.color = new Color(r, g, b, 255);

        // 设置大小
        const transform = node.addComponent(UITransform);
        const size = this.NODE_SIZE + dragon.level * 2; // 高级灵兽稍大
        transform.setContentSize(size, size);

        // 显示等级文字
        const label = node.addComponent(Label);
        label.string = `Lv${dragon.level}`;
        label.fontSize = 16;
        label.color = new Color(255, 255, 255, 255);
        label.horizontalAlign = 1;
        label.verticalAlign = 1;

        parent.addChild(node);
        return node;
    }

    /**
     * 更新灵兽节点颜色（反应等级）
     */
    public static updateNodeColor(node: Node, level: number): void {
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            const [r, g, b] = this.LEVEL_COLORS[Math.min(level - 1, this.LEVEL_COLORS.length - 1)];
            sprite.color = new Color(r, g, b, 255);
        }
    }

    /**
     * 播放合成动画
     * 缩放弹跳 + 发光闪烁
     */
    public static playMergeAnim(node: Node): void {
        // 放大后缩小（弹跳）
        tween(node)
            .to(0.15, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * 播放召唤落地下沉动画
     */
    public static playSummonAnim(node: Node): void {
        node.setScale(0, 0, 0);
        tween(node)
            .to(0.3, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /**
     * 高亮节点（金色边框效果）
     */
    public static highlightNode(node: Node, on: boolean): void {
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.color = on
                ? new Color(255, 215, 0, 255)   // 金色高亮
                : new Color(200, 200, 200, 255); // 恢复白色
        }
    }
}