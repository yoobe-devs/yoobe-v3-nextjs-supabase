# Spec Kit Integration Rules for Yoobe v3 Platform

## Overview

Spec Kit (Spec Workflow MCP) is integrated into the development workflow to ensure systematic documentation updates, platform improvements, and structured development processes.

## Core Integration Rules

### 1. Documentation Management

- **Always use Spec Kit** when updating project documentation
- **Create specifications** for new features before implementation
- **Track documentation changes** through Spec Kit's approval workflow
- **Maintain error knowledge base** updates through Spec Kit specifications
- **Generate HTML documentation** with colored, indented visuals as preferred

### 2. Platform Improvement Workflow

- **Use `/spec` commands** to create improvement specifications
- **Track platform insights** through Spec Kit's task management
- **Document bug reports** and resolutions systematically
- **Create approval workflows** for major platform changes
- **Monitor progress** through the real-time dashboard (port 3456)

### 3. Development Process Integration

- **Pre-implementation**: Create specifications for all new features
- **During development**: Track progress and document changes
- **Post-implementation**: Update documentation and error knowledge base
- **Continuous improvement**: Use insights to enhance platform capabilities

### 4. Error Management

- **Document all errors** encountered during development
- **Create resolution specifications** for complex issues
- **Update error knowledge base** systematically
- **Track error patterns** for platform improvements

### 5. Audit and Compliance

- **Maintain audit trails** through Spec Kit's tracking system
- **Document all changes** with proper specifications
- **Ensure rollback safety** through structured workflows
- **Create compliance documentation** for platform features

## Spec Kit Commands Usage

### Primary Commands

- `/spec create` - Create new specifications
- `/spec track` - Track development progress
- `/spec approve` - Manage approval workflows
- `/spec bug` - Handle bug reports and resolutions
- `/spec docs` - Update documentation

### Dashboard Access

- **URL**: http://localhost:3456
- **Auto-start**: Enabled in MCP configuration
- **Real-time updates**: Monitor specifications and tasks

## Integration with Existing Tools

### MCP Server Stack

- **Spec Kit**: Documentation and workflow management
- **MCP_DOCKER**: Container and deployment management
- **Gemini MCP**: AI assistance and code generation
- **Context7**: Context management and search
- **Playwright**: Testing and automation

### Workflow Integration

1. **Spec Kit** creates specifications and tracks progress
2. **Other MCP tools** execute the actual development work
3. **Spec Kit** documents results and updates knowledge base
4. **Continuous loop** of improvement and documentation

## Quality Standards

### Documentation Quality

- **HTML format** with colored, indented visuals
- **Structured specifications** for all features
- **Updated changelog** with each version
- **Error knowledge base** maintenance

### Platform Improvement

- **Data-driven insights** from Spec Kit analytics
- **Systematic approach** to platform enhancements
- **Audit-first methodology** for all changes
- **Rollback-safe execution** of improvements

## Compliance Requirements

### User Preferences

- **Autonomous execution** without constant confirmation
- **End-to-end task completion** including documentation
- **Audit-first, incremental approach** to all changes
- **Visual documentation** in HTML format

### Platform Standards

- **Structured development workflows**
- **Comprehensive error tracking**
- **Systematic documentation updates**
- **Continuous platform improvement**

## Implementation Notes

### Current Configuration

- **MCP Server**: `@pimzino/spec-workflow-mcp@latest`
- **Project Path**: `/Users/genautech/Downloads/v3-main/yoobe-v3`
- **Dashboard Port**: 3456
- **Auto-start**: Enabled

### Usage Guidelines

- **Always start** with Spec Kit specifications for new work
- **Document everything** through the structured workflow
- **Use insights** to drive platform improvements
- **Maintain consistency** across all development activities

This integration ensures that Spec Kit becomes a central tool for maintaining high-quality documentation, tracking platform improvements, and providing systematic insights for continuous enhancement of the Yoobe v3 platform.


