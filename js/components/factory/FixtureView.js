import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/components/factory/FixtureView.tsx";
import { objectValues, tuple } from "../../utils/types.js";
import { PathTypeID, PathFixtureID } from "../../types/data.js";
import { EditMode } from "../../types/editMode.js";
import { useEdit } from "../../contexts/edit.js";
import { useDragging } from "../../contexts/dragging.js";
import { usePathEditing } from "../../contexts/pathEditing.js";
import { useLocalization } from "../../contexts/localization.js";
import { cn } from "../../utils/react.js";
import { FixtureBehaviorType, pathFixtures } from "../../data/pathFixtures.js";
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
export function FixtureView({ fixture, cellSize }) {
    const loc = useLocalization();
    const { editMode, selectedIDs, selectEntity } = useEdit();
    const { handleDragStart, handleDragMove, handleDragEnd } = useDragging();
    const { startPathFromPortOrFixture, finishPathAtPortOrFixture } = usePathEditing();
    const x = fixture.x * cellSize;
    const y = fixture.y * cellSize;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const selected = selectedIDs.has(fixture.id);
    const pointerEventsEnabled = editMode === EditMode.MANIPULATE;
    // Get fixture definition to render side arrows
    const fixtureDef = pathFixtures[fixture.type];
    const hasError = objectValues(fixture.errorFlags ?? {}).some(flag => flag);
    const className = cn("fixture-box", {
        error: hasError,
        selected: selected,
        "pointer-events-none": !pointerEventsEnabled,
    });
    function handleClick(e) {
        e.stopPropagation();
        // Only allow selection in manipulate mode
        if (editMode === EditMode.MANIPULATE) {
            selectEntity(fixture.id, e.shiftKey || e.ctrlKey || e.metaKey);
        }
    }
    function handleDoubleClick(e) {
        e.stopPropagation();
        const position = tuple(fixture.x, fixture.y);
        if (editMode === EditMode.PATH_EDITING) {
            // Finish the path at this fixture
            finishPathAtPortOrFixture(fixture.id, position);
        }
        else {
            // Start a new path from this fixture
            startPathFromPortOrFixture(fixture.id, position, fixtureDef.pathType);
        }
    }
    function handlePointerDown(e) {
        if (e.button === 0) {
            handleDragStart(e, fixture.id);
        }
    }
    function handlePointerMove(e) {
        handleDragMove(e);
    }
    function handlePointerUp(e) {
        handleDragEnd(e);
    }
    return (_jsxDEV("g", { className: "fixture", onClick: handleClick, onDoubleClick: handleDoubleClick, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, children: [_jsxDEV("rect", { x: x, y: y, width: cellSize, height: cellSize, className: className }, void 0, false, { fileName: _jsxFileName, lineNumber: 120, columnNumber: 13 }, this), _jsxDEV("foreignObject", { x: x, y: y, width: cellSize, height: cellSize, transform: `rotate(${fixture.rotation} ${centerX} ${centerY})`, className: "fixture-icon", children: fixtureDef.behaviorType === FixtureBehaviorType.BRIDGE ? _jsxDEV(Shuffle, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 136, columnNumber: 74 }, this) :
                    fixtureDef.behaviorType === FixtureBehaviorType.SPLITTER ? _jsxDEV(Split, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 137, columnNumber: 75 }, this) :
                        fixtureDef.behaviorType === FixtureBehaviorType.CONVERGER ? _jsxDEV(Merge, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 138, columnNumber: 76 }, this) :
                            fixtureDef.behaviorType === FixtureBehaviorType.CONTROL_PORT ? _jsxDEV(Wrench, { size: 12 }, void 0, false, { fileName: _jsxFileName, lineNumber: 139, columnNumber: 79 }, this) : null }, void 0, false, { fileName: _jsxFileName, lineNumber: 128, columnNumber: 13 }, this), fixture.sides.map((side, index) => {
                // Apply fixture rotation to the side direction
                const rotatedDirection = side.direction;
                const [offsetX, offsetY] = getDirectionOffset(rotatedDirection, cellSize * 0.45);
                const isInput = side.subType === 'input';
                const arrowRotation = getArrowRotation(rotatedDirection, isInput);
                const arrowSize = 0.25 * cellSize;
                const arrowCenterX = centerX + offsetX;
                const arrowCenterY = centerY + offsetY;
                const arrowPoints = `${arrowCenterX},${arrowCenterY - arrowSize / Math.sqrt(3)} ${arrowCenterX - arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))} ${arrowCenterX + arrowSize / 2},${arrowCenterY + arrowSize / (2 * Math.sqrt(3))}`;
                const arrowColor = side.type === 'pipe' ? '#42a5f5' : '#ffffff';
                return (_jsxDEV("polygon", { points: arrowPoints, fill: arrowColor, transform: `rotate(${arrowRotation} ${arrowCenterX} ${arrowCenterY})` }, index, false, { fileName: _jsxFileName, lineNumber: 155, columnNumber: 25 }, this));
            })] }, void 0, true, { fileName: _jsxFileName, lineNumber: 111, columnNumber: 13 }, this));
}
