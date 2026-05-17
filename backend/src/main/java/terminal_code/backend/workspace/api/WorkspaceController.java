package terminal_code.backend.workspace.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import terminal_code.backend.auth.api.JwtAuthenticationFilter.JwtPrincipal;
import terminal_code.backend.workspace.application.WorkspaceService;
import terminal_code.backend.workspace.dto.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> listWorkspaces(@AuthenticationPrincipal JwtPrincipal principal) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.ok(workspaceService.getUserWorkspaces(userId));
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
        @AuthenticationPrincipal JwtPrincipal principal,
        @Valid @RequestBody WorkspaceCreateRequest req
    ) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(workspaceService.createWorkspace(userId, req));
    }

    @PatchMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId,
        @Valid @RequestBody WorkspaceUpdateRequest req
    ) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.ok(workspaceService.updateWorkspace(userId, workspaceId, req));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId
    ) {
        UUID userId = UUID.fromString(principal.userId());
        workspaceService.deleteWorkspace(userId, workspaceId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{workspaceId}/star")
    public ResponseEntity<WorkspaceResponse> setStarred(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId,
        @RequestParam boolean starred
    ) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.ok(workspaceService.setStarred(userId, workspaceId, starred));
    }

    // Projects

    @PostMapping("/{workspaceId}/projects")
    public ResponseEntity<ProjectResponse> addProject(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId,
        @Valid @RequestBody ProjectCreateRequest req
    ) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(workspaceService.addProject(userId, workspaceId, req));
    }

    @PutMapping("/{workspaceId}/projects/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId,
        @PathVariable UUID projectId,
        @Valid @RequestBody ProjectCreateRequest req
    ) {
        UUID userId = UUID.fromString(principal.userId());
        return ResponseEntity.ok(workspaceService.updateProject(userId, workspaceId, projectId, req));
    }

    @DeleteMapping("/{workspaceId}/projects/{projectId}")
    public ResponseEntity<Void> deleteProject(
        @AuthenticationPrincipal JwtPrincipal principal,
        @PathVariable UUID workspaceId,
        @PathVariable UUID projectId
    ) {
        UUID userId = UUID.fromString(principal.userId());
        workspaceService.deleteProject(userId, workspaceId, projectId);
        return ResponseEntity.noContent().build();
    }
}
