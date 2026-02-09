import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const _jsxFileName = "E:/Projects/endfield-factory-planner/ts/contexts/edit.tsx";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { FieldTemplateID } from "../types/data.js";
import { EditMode } from "../types/editMode.js";
import { createInitialTemplateChanges, createStateFromChanges } from "../game/sampleField.js";
import { createDeleteChanges, createNudgeChanges } from "../game/entityOperations.js";
import { rotateSelection } from "../game/rotation.js";
import { isProjectJsonV1 } from "../types/external.js";
import { buildProjectJson, createProjectMeta, ensureUniqueGuid, loadProject, loadProjectListing, saveProject, saveProjectListing, setProjectHidden, upsertProjectMeta, } from "../utils/projectStorage.js";
import { useBugReportSnapshotSetter } from "../contexts/bugReport.js";
const EditContext = createContext(null);
export function useEdit() {
    const context = useContext(EditContext);
    if (!context) {
        throw new Error("useEdit must be used within EditProvider");
    }
    return context;
}
export function EditProvider({ children, initialTemplate = FieldTemplateID.WULING_MAIN }) {
    const setBugReportSnapshot = useBugReportSnapshotSetter();
    const initialChanges = createInitialTemplateChanges(initialTemplate);
    const [editMode, setEditMode] = useState(EditMode.MANIPULATE);
    const [selectedIDs, setSelectedIDs] = useState(new Set());
    const [undoStack, setUndoStack] = useState(() => initialChanges);
    const [redoStack, setRedoStack] = useState([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
    const [projectListing, setProjectListing] = useState(() => loadProjectListing().projects);
    const [currentProject, setCurrentProject] = useState(null);
    const lastSavedKeyRef = useRef(null);
    const [fieldState, setFieldState] = useState(() => createStateFromChanges(initialChanges, initialTemplate));
    function selectEntity(id, addToSelection) {
        // Only allow selection in manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        if (addToSelection) {
            // Toggle selection
            const newSelection = new Set(selectedIDs);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            }
            else {
                newSelection.add(id);
            }
            setSelectedIDs(newSelection);
        }
        else {
            // Replace selection
            setSelectedIDs(new Set([id]));
        }
    }
    function clearSelection() {
        setSelectedIDs(new Set());
    }
    function toggleSelectAll() {
        // Only allow select all in manipulate mode
        if (editMode !== EditMode.MANIPULATE) {
            return;
        }
        if (selectedIDs.size === fieldState.facilities.length + fieldState.pathFixtures.length + fieldState.paths.length) {
            clearSelection();
        }
        else {
            const allIDs = new Set();
            for (const facility of fieldState.facilities) {
                allIDs.add(facility.id);
            }
            for (const fixture of fieldState.pathFixtures) {
                allIDs.add(fixture.id);
            }
            for (const path of fieldState.paths) {
                allIDs.add(path.id);
            }
            setSelectedIDs(allIDs);
        }
    }
    function handleChange(change) {
        const newUndoStack = [...undoStack, change];
        setUndoStack(newUndoStack);
        setRedoStack([]);
        setFieldState(createStateFromChanges(newUndoStack, fieldState.template));
    }
    function applyChangeOrMulti(changes) {
        if (changes.length === 0) {
            return;
        }
        if (changes.length === 1) {
            handleChange(changes[0]);
        }
        else {
            handleChange({ type: 'multi', changes });
        }
    }
    function handleUndo() {
        // Only allow undo in manipulate mode
        if (editMode !== EditMode.MANIPULATE || undoStack.length === 0) {
            return;
        }
        const lastChange = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [...redoStack, lastChange];
        setUndoStack(newUndoStack);
        setRedoStack(newRedoStack);
        setFieldState(createStateFromChanges(newUndoStack, fieldState.template));
    }
    function handleRedo() {
        // Only allow redo in manipulate mode
        if (editMode !== EditMode.MANIPULATE || redoStack.length === 0) {
            return;
        }
        const lastRedoChange = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        const newUndoStack = [...undoStack, lastRedoChange];
        setUndoStack(newUndoStack);
        setRedoStack(newRedoStack);
        setFieldState(createStateFromChanges(newUndoStack, fieldState.template));
    }
    function handleDelete() {
        // Only allow delete in manipulate mode
        if (editMode !== EditMode.MANIPULATE || selectedIDs.size === 0) {
            return;
        }
        const deleteChanges = createDeleteChanges(selectedIDs, fieldState);
        applyChangeOrMulti(deleteChanges);
        setSelectedIDs(new Set());
    }
    function handleRotate(clockwise = true) {
        // Only allow rotate in manipulate mode
        if (editMode !== EditMode.MANIPULATE || selectedIDs.size === 0) {
            return;
        }
        const rotationChanges = rotateSelection(fieldState, selectedIDs, clockwise);
        applyChangeOrMulti(rotationChanges);
    }
    function handleNudge(dx, dy) {
        // Only allow nudge in manipulate mode
        if (editMode !== EditMode.MANIPULATE || selectedIDs.size === 0) {
            return;
        }
        const nudgeChanges = createNudgeChanges(selectedIDs, fieldState, dx, dy);
        applyChangeOrMulti(nudgeChanges);
    }
    function openTemplateModal() {
        setIsTemplateModalOpen(true);
    }
    function closeTemplateModal() {
        setIsTemplateModalOpen(false);
    }
    function applyProjectSettings(template, projectName) {
        setFieldState(createStateFromChanges(undoStack, template));
        setIsTemplateModalOpen(false);
        if (!currentProject) {
            return;
        }
        const updatedMeta = {
            ...currentProject,
            name: projectName || currentProject.name,
            updatedAt: new Date().toISOString(),
        };
        const project = buildProjectJson(updatedMeta, template, undoStack);
        saveProject(project);
        const nextListing = upsertProjectMeta({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, updatedMeta);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
        setCurrentProject(updatedMeta);
    }
    function startNewProject(template, projectName) {
        const name = projectName?.trim() ?? "";
        const meta = createProjectMeta(name);
        const newChanges = createInitialTemplateChanges(template);
        setUndoStack(newChanges);
        setRedoStack([]);
        setSelectedIDs(new Set());
        setFieldState(createStateFromChanges(newChanges, template));
        setIsOnboardingOpen(false);
        setIsTemplateModalOpen(false);
        const project = buildProjectJson(meta, template, newChanges);
        saveProject(project);
        const nextListing = upsertProjectMeta({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, meta);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
        setCurrentProject(meta);
        return meta;
    }
    function openOnboarding() {
        setIsOnboardingOpen(true);
        setIsTemplateModalOpen(false);
        setEditMode(EditMode.MANIPULATE);
        setSelectedIDs(new Set());
    }
    function closeOnboarding() {
        setIsOnboardingOpen(false);
    }
    function loadProjectByGuid(guid) {
        const project = loadProject(guid);
        if (!project) {
            return;
        }
        setUndoStack(project.changes);
        setRedoStack([]);
        setSelectedIDs(new Set());
        setFieldState(createStateFromChanges(project.changes, project.template));
        setIsOnboardingOpen(false);
        setIsTemplateModalOpen(false);
        setCurrentProject(project.meta);
        const nextListing = upsertProjectMeta({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, project.meta);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
    }
    function toggleProjectHidden(guid, hidden) {
        const nextListing = setProjectHidden({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, guid, hidden);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
    }
    function importProjectJson(jsonText) {
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        }
        catch {
            return;
        }
        if (!isProjectJsonV1(parsed)) {
            return;
        }
        const project = parsed;
        const now = new Date().toISOString();
        const uniqueGuid = ensureUniqueGuid({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, project.meta.guid);
        const meta = {
            ...project.meta,
            guid: uniqueGuid,
            updatedAt: now,
        };
        const normalizedProject = buildProjectJson(meta, project.template, project.changes);
        saveProject(normalizedProject);
        const nextListing = upsertProjectMeta({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, meta);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
    }
    function exportCurrentProject() {
        if (!currentProject) {
            return;
        }
        const project = buildProjectJson(currentProject, fieldState.template, undoStack);
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const safeName = (currentProject.name || "project").trim() || "project";
        const fileName = `${safeName.replace(/[^a-z0-9-_]+/gi, "_")}.json`;
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }
    const canUndo = editMode === EditMode.MANIPULATE && undoStack.length > 0;
    const canRedo = editMode === EditMode.MANIPULATE && redoStack.length > 0;
    const canExportProject = currentProject !== null;
    useEffect(() => {
        if (!currentProject) {
            return;
        }
        const templateKey = typeof fieldState.template === "string" ? fieldState.template : JSON.stringify(fieldState.template);
        const saveKey = `${currentProject.guid}:${undoStack.length}:${templateKey}`;
        if (lastSavedKeyRef.current === saveKey) {
            return;
        }
        lastSavedKeyRef.current = saveKey;
        const updatedMeta = {
            ...currentProject,
            updatedAt: new Date().toISOString(),
        };
        const project = buildProjectJson(updatedMeta, fieldState.template, undoStack);
        saveProject(project);
        const nextListing = upsertProjectMeta({
            type: "endfield-factory-planner-project-listing",
            version: 1,
            projects: projectListing,
        }, updatedMeta);
        setProjectListing(nextListing.projects);
        saveProjectListing(nextListing);
        setCurrentProject(updatedMeta);
    }, [currentProject, fieldState.template, projectListing, undoStack]);
    useEffect(() => {
        const snapshot = {
            editMode,
            selectedIDs: Array.from(selectedIDs),
            fieldState,
            undoStack,
            redoStack,
            isTemplateModalOpen,
            isOnboardingOpen,
            projectListing,
            currentProject,
            canUndo,
            canRedo,
            canExportProject,
        };
        setBugReportSnapshot(snapshot);
    }, [
        editMode,
        selectedIDs,
        fieldState,
        undoStack,
        redoStack,
        isTemplateModalOpen,
        isOnboardingOpen,
        projectListing,
        currentProject,
        canUndo,
        canRedo,
        canExportProject,
        setBugReportSnapshot,
    ]);
    const value = {
        editMode,
        setEditMode,
        selectedIDs,
        setSelectedIDs,
        selectEntity,
        clearSelection,
        toggleSelectAll,
        fieldState,
        setFieldState,
        undoStack,
        redoStack,
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,
        handleChange,
        applyChangeOrMulti,
        handleDelete,
        handleRotate,
        handleNudge,
        isTemplateModalOpen,
        openTemplateModal,
        closeTemplateModal,
        applyProjectSettings,
        startNewProject,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
        projectListing,
        currentProject,
        loadProjectByGuid,
        toggleProjectHidden,
        importProjectJson,
        exportCurrentProject,
        canExportProject,
    };
    return (_jsxDEV(EditContext.Provider, { value: value, children: children }, void 0, false, { fileName: _jsxFileName, lineNumber: 482, columnNumber: 13 }, this));
}
