package terminal_code.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import terminal_code.backend.common.ResourceNotFoundException;
import terminal_code.backend.common.WorkspaceNotFoundException;
import terminal_code.backend.entity.*;
import terminal_code.backend.repository.*;
import terminal_code.backend.dto.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;

@Service
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, ProjectRepository projectRepository) {
        this.workspaceRepository = workspaceRepository;
        this.projectRepository = projectRepository;
    }

    // Workspaces

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getUserWorkspaces(UUID userId) {
        List<Workspace> workspaces = workspaceRepository.findByUserIdOrderBySortOrderAsc(userId);
        if (workspaces.isEmpty()) return List.of();

        List<UUID> workspaceIds = workspaces.stream().map(Workspace::getId).toList();
        Map<UUID, List<Project>> projectsByWorkspace = projectRepository
            .findByWorkspaceIdInOrderBySortOrderAsc(workspaceIds)
            .stream()
            .collect(groupingBy(p -> p.getWorkspace().getId()));

        return workspaces.stream()
            .map(ws -> toWorkspaceResponse(ws, projectsByWorkspace.getOrDefault(ws.getId(), List.of())))
            .toList();
    }

    public WorkspaceResponse createWorkspace(UUID userId, WorkspaceCreateRequest req) {
        Workspace ws = new Workspace(userId, req.name(), req.description(), req.color(), req.icon());
        ws = workspaceRepository.save(ws);
        return toWorkspaceResponse(ws, List.of());
    }

    public WorkspaceResponse updateWorkspace(UUID userId, UUID workspaceId, WorkspaceUpdateRequest req) {
        Workspace ws = getWorkspaceForUser(userId, workspaceId);
        if (req.name() != null) ws.setName(req.name());
        if (req.description() != null) ws.setDescription(req.description());
        if (req.color() != null) ws.setColor(req.color());
        if (req.icon() != null) ws.setIcon(req.icon());
        if (req.isStarred() != null) ws.setStarred(req.isStarred());
        if (req.sortOrder() != null) ws.setSortOrder(req.sortOrder());
        ws = workspaceRepository.save(ws);
        return toWorkspaceResponse(ws, fetchProjects(ws.getId()));
    }

    public void deleteWorkspace(UUID userId, UUID workspaceId) {
        Workspace ws = getWorkspaceForUser(userId, workspaceId);
        workspaceRepository.delete(ws);
    }

    // Projects

    public ProjectResponse addProject(UUID userId, UUID workspaceId, ProjectCreateRequest req) {
        Workspace ws = getWorkspaceForUser(userId, workspaceId);
        Project project = new Project(ws, req.name(), req.localPath(), req.description());
        project = projectRepository.save(project);
        return toProjectResponse(project);
    }

    public ProjectResponse updateProject(UUID userId, UUID workspaceId, UUID projectId, ProjectCreateRequest req) {
        getWorkspaceForUser(userId, workspaceId);
        Project p = projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        p.setName(req.name());
        p.setLocalPath(req.localPath());
        if (req.description() != null) p.setDescription(req.description());
        return toProjectResponse(projectRepository.save(p));
    }

    public void deleteProject(UUID userId, UUID workspaceId, UUID projectId) {
        getWorkspaceForUser(userId, workspaceId);
        Project p = projectRepository.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        projectRepository.delete(p);
    }

    public WorkspaceResponse setStarred(UUID userId, UUID workspaceId, boolean starred) {
        Workspace ws = getWorkspaceForUser(userId, workspaceId);
        ws.setStarred(starred);
        ws = workspaceRepository.save(ws);
        return toWorkspaceResponse(ws, fetchProjects(ws.getId()));
    }

    // Mappers

    private WorkspaceResponse toWorkspaceResponse(Workspace ws, List<Project> projects) {
        return new WorkspaceResponse(
            ws.getId().toString(),
            ws.getName(),
            ws.getDescription(),
            ws.getColor(),
            ws.getIcon(),
            ws.isStarred(),
            ws.getSortOrder(),
            ws.getCreatedAt(),
            ws.getUpdatedAt(),
            projects.stream().map(this::toProjectResponse).collect(toList())
        );
    }

    private ProjectResponse toProjectResponse(Project p) {
        return new ProjectResponse(
            p.getId().toString(),
            p.getName(),
            p.getLocalPath(),
            p.getDescription(),
            p.isStarred(),
            p.getLastOpenedAt(),
            p.getSortOrder(),
            p.getCreatedAt(),
            p.getUpdatedAt()
        );
    }

    private Workspace getWorkspaceForUser(UUID userId, UUID workspaceId) {
        return workspaceRepository.findByIdAndUserId(workspaceId, userId)
            .orElseThrow(() -> new WorkspaceNotFoundException("Workspace not found"));
    }

    private List<Project> fetchProjects(UUID workspaceId) {
        return projectRepository.findByWorkspaceIdOrderBySortOrderAsc(workspaceId);
    }
}
