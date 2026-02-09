import { useEffect, useRef } from "react";
import { useEdit } from "../contexts/edit.js";
import { detectPathCrossings, findEphemeralBridgesToCleanup } from "../game/fixtures.js";
import { PathFixtureID, PathTypeID } from "../types/data.js";
/**
 * Hook to automatically create ephemeral bridges at path crossings
 * and clean them up when they're no longer needed.
 *
 * @param enabled Whether auto-bridge functionality is enabled
 */
export function useAutoBridges(enabled = true) {
    const { fieldState, handleChange } = useEdit();
    const processingRef = useRef(false);
    const timeoutRef = useRef(null);
    useEffect(() => {
        if (!enabled || processingRef.current) {
            return;
        }
        // Clear any pending timeout
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        // Debounce the check to avoid rapid updates during recalculation
        timeoutRef.current = window.setTimeout(() => {
            // Combine detection and cleanup in a single effect to avoid race conditions
            const crossings = detectPathCrossings(fieldState);
            const bridgesToRemove = findEphemeralBridgesToCleanup(fieldState);
            const changes = [];
            // Add bridges for new crossings
            for (const crossing of crossings) {
                const fixtureType = crossing.pathType === PathTypeID.BELT
                    ? PathFixtureID.BELT_BRIDGE
                    : PathFixtureID.PIPE_BRIDGE;
                changes.push({
                    type: 'add-path-fixture',
                    fixtureType,
                    position: crossing.position,
                    rotation: 0,
                    isEphemeral: true
                });
            }
            // Remove bridges that are no longer needed
            for (const fixtureID of bridgesToRemove) {
                changes.push({
                    type: 'remove-path-fixture',
                    fixtureID
                });
            }
            // Only apply changes if there are any
            if (changes.length > 0) {
                processingRef.current = true;
                const multiChange = {
                    type: 'multi',
                    changes
                };
                handleChange(multiChange);
                // Reset the flag after state settles
                setTimeout(() => {
                    processingRef.current = false;
                }, 50);
            }
            timeoutRef.current = null;
        }, 100);
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fieldState.paths.length, fieldState.pathFixtures.length, enabled]); // Only run when counts change
}
