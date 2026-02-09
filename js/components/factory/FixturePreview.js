import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FixturePreview.tsx";
import { PathFixtureID } from "../../types/data.js";
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.js";
import { cn } from "../../utils/react.js";
import { Merge, Shuffle, Split, Wrench } from "lucide-react";
function getDirectionOffset(direction, offset) {
    switch (direction) {
        case "up":
            return [0, -offset];
        case "down":
            return [0, offset];
        case "left":
            return [-offset, 0];
        case "right":
            return [offset, 0];
        default:
            return [0, 0];
    }
}
function getArrowRotation(direction, isInput) {
    const rotations = {
        up: 0,
        down: 180,
        left: 270,
        right: 90,
    };
    const baseRotation = rotations[direction] ?? 0;
    return isInput ? baseRotation + 180 : baseRotation;
}
function rotateDirection(direction, degrees) {
    const dirs = ['up', 'right', 'down', 'left'];
    const currentIndex = dirs.indexOf(direction);
    const steps = (degrees / 90) % 4;
    const newIndex = (currentIndex + steps + 4) % 4;
    return dirs[newIndex];
}
export function FixturePreview({ fixtureType, position, rotation, cellSize, isValid }) {
    const fixtureDef = pathFixtures[fixtureType];
    if (!fixtureDef) {
        return null;
    }
    const x = position[0] * cellSize;
    const y = position[1] * cellSize;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const className = cn("fixture-preview", {
        "fixture-preview-valid": isValid,
        "fixture-preview-invalid": !isValid
    });
    return (_jsxDEV("g", { className: className, children: [_jsxDEV("rect", { x: x, y: y, width: cellSize, height: cellSize, className: "fixture-preview-background", opacity: 0.5 }, void 0, false, { fileName: _jsxFileName, lineNumber: 67, columnNumber: 13 }, this), _jsxDEV("foreignObject", { x: x, y: y, width: cellSize, height: cellSize, transform: `rotate(${rotation} ${centerX} ${centerY})`, className: "fixture-icon", children: fixtureDef.behaviorType === FixtureBehaviorType.BRIDGE ? _jsxDEV(Shuffle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 83, columnNumber: 74 }, this) :
                    fixtureDef.behaviorType === FixtureBehaviorType.SPLITTER ? _jsxDEV(Split, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 84, columnNumber: 75 }, this) :
                        fixtureDef.behaviorType === FixtureBehaviorType.CONVERGER ? _jsxDEV(Merge, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 85, columnNumber: 76 }, this) :
                            fixtureDef.behaviorType === FixtureBehaviorType.CONTROL_PORT ? _jsxDEV(Wrench, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 86, columnNumber: 79 }, this) : null }, void 0, false, { fileName: _jsxFileName, lineNumber: 75, columnNumber: 13 }, this), fixtureDef.sides.map((side, index) => {
                // Apply fixture rotation to the side direction
                const rotatedDirection = rotateDirection(side.direction, rotation);
                const [offsetX, offsetY] = getDirectionOffset(rotatedDirection, cellSize * 0.45);
                const isInput = side.subType === 'input';
                const arrowRotation = getArrowRotation(rotatedDirection, isInput);
                const arrowSize = 0.25 * cellSize;
                const arrowCenterX = centerX + offsetX;
                const arrowCenterY = centerY + offsetY;
                const arrowPoints = `${arrowCenterX},${arrowCenterY - arrowSize / Math.sqrt(3)} ${arrowCenterX - arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))} ${arrowCenterX + arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))}`;
                const arrowColor = side.type === 'pipe' ? '#42a5f5' : '#ffffff';
                return (_jsxDEV("polygon", { points: arrowPoints, fill: arrowColor, transform: `rotate(${arrowRotation} ${arrowCenterX} ${arrowCenterY})`, opacity: 0.7 }, index, false, { fileName: _jsxFileName, lineNumber: 102, columnNumber: 25 }, this));
            })] }, void 0, true, { fileName: _jsxFileName, lineNumber: 64, columnNumber: 13 }, this));
}
