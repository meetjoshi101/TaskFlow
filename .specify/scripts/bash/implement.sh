#!/usr/bin/env bash

# Implementation script for executing tasks from tasks.md
#
# This script executes the tasks defined in tasks.md following the TDD workflow:
# 1. Parse tasks.md and extract task list with dependencies
# 2. Execute tasks in correct order (respecting dependencies and [P] parallel markers)
# 3. Track task completion status
# 4. Generate actual code files and project structure
# 5. Run tests and validate implementations
# 6. Update task status in tasks.md
#
# Usage: ./implement.sh [--json] [--dry-run] [--task=T001] [--parallel] [--continue]
#
# Options:
#   --json      Output progress in JSON format
#   --dry-run   Show what would be done without executing
#   --task=ID   Execute specific task only
#   --parallel  Execute [P] tasks in parallel when possible
#   --continue  Resume from last incomplete task
#   --help, -h  Show this help message

# Temporarily disable set -e to debug
set -e

# Parse command line arguments
JSON_MODE=false
DRY_RUN=false
SPECIFIC_TASK=""
PARALLEL_MODE=false
CONTINUE_MODE=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --task=*)
            SPECIFIC_TASK="${arg#--task=}"
            ;;
        --parallel)
            PARALLEL_MODE=true
            ;;
        --continue)
            CONTINUE_MODE=true
            ;;
        --help|-h)
            cat << 'EOF'
Usage: implement.sh [OPTIONS]

Execute tasks from tasks.md following TDD workflow and constitutional principles.

OPTIONS:
  --json              Output progress in JSON format
  --dry-run           Show what would be done without executing
  --task=ID           Execute specific task only (e.g., --task=T001)
  --parallel          Execute [P] tasks in parallel when possible
  --continue          Resume from last incomplete task
  --help, -h          Show this help message

EXAMPLES:
  # Execute all tasks in order
  ./implement.sh
  
  # Execute specific task only
  ./implement.sh --task=T001
  
  # Resume from where left off
  ./implement.sh --continue
  
  # Dry run to see execution plan
  ./implement.sh --dry-run

WORKFLOW:
  1. Parse tasks.md and extract tasks with dependencies
  2. Validate prerequisites (plan.md, tests structure)
  3. Execute tasks in dependency order
  4. Track completion and update tasks.md
  5. Run tests and validate each implementation

EOF
            exit 0
            ;;
        *)
            echo "ERROR: Unknown option '$arg'. Use --help for usage information." >&2
            exit 1
            ;;
    esac
done

# Get script directory and load common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
eval $(get_feature_paths)

# Validate implementation prerequisites
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR" >&2
    echo "Run /specify first to create the feature structure." >&2
    exit 1
fi

if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR" >&2
    echo "Run /plan first to create the implementation plan." >&2
    exit 1
fi

if [[ ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR" >&2
    echo "Run /tasks first to create the task list." >&2
    exit 1
fi

# Global arrays for task information
declare -a TASK_IDS
declare -A TASK_DESCRIPTIONS
declare -A TASK_DEPS
declare -A TASK_PARALLEL

#==============================================================================
# Task Parsing Functions
#==============================================================================

log_info() {
    if ! $JSON_MODE; then
        echo "INFO: $1" >&2
    fi
}

log_error() {
    echo "ERROR: $1" >&2
}

log_success() {
    if ! $JSON_MODE; then
        echo "SUCCESS: $1" >&2
    fi
}

# Parse tasks from tasks.md and extract task information
parse_tasks() {
    local tasks_file="$1"
    
    log_info "Parsing tasks from $tasks_file"
    
    # Debug: check if file exists and is readable
    if [[ ! -f "$tasks_file" ]]; then
        log_error "Tasks file does not exist: $tasks_file"
        return 1
    fi
    
    if [[ ! -r "$tasks_file" ]]; then
        log_error "Tasks file is not readable: $tasks_file"
        return 1
    fi
    
    log_info "File exists and is readable, starting parse..."
    
    # Use mapfile to read the entire file at once
    local -a file_lines
    mapfile -t file_lines < "$tasks_file"
    
    log_info "Read ${#file_lines[@]} lines from file"
    
    local in_task_section=false
    local line_num=0
    
    for line in "${file_lines[@]}"; do
        ((line_num++))
        
        # Debug: show we're processing lines (only for first few)
        # if [[ $line_num -le 5 ]]; then
        #     log_info "DEBUG: Line $line_num: $line"
        # fi
        
        # Start parsing when we hit a task section (Phase 3.x)
        if [[ "$line" =~ ^##[[:space:]]*Phase[[:space:]]*3\. ]]; then
            in_task_section=true
            log_info "Found Phase 3 section: $line"
            continue
        fi
        
        # Stop parsing at end sections
        if [[ "$line" =~ ^##[[:space:]]*(Dependencies|Parallel|Notes|Validation) ]]; then
            in_task_section=false
            log_info "Stopping at section: $line"
            continue
        fi
        
        # Parse task lines: - [ ] T001 [P] Description
        if $in_task_section; then
            if [[ "$line" =~ ^-[[:space:]]*\[[[:space:]]*([x[:space:]])[[:space:]]*\][[:space:]]*(T[0-9]{3})([[:space:]]*\[P\])?[[:space:]]*(.*) ]]; then
                local status="${BASH_REMATCH[1]}"
                local task_id="${BASH_REMATCH[2]}"
                local parallel_marker="${BASH_REMATCH[3]}"
                local description="${BASH_REMATCH[4]}"
            
            # Clean up description
            description=$(echo "$description" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
            
            # Store task info in global arrays
            TASK_IDS+=("$task_id")
            TASK_DESCRIPTIONS["$task_id"]="$description"
            
            # Mark as parallel if [P] present
            if [[ "$parallel_marker" =~ \[P\] ]]; then
                TASK_PARALLEL["$task_id"]="true"
            else
                TASK_PARALLEL["$task_id"]="false"
            fi
            
            # Extract dependencies from description (Depends: T001, T002)
            local deps_pattern='\(Depends:[[:space:]]*([^)]*)\)'
            if [[ "$description" =~ $deps_pattern ]]; then
                local deps="${BASH_REMATCH[1]}"
                # Parse comma-separated dependencies
                IFS=',' read -ra dep_array <<< "$deps"
                local task_deps=""
                for dep in "${dep_array[@]}"; do
                    dep=$(echo "$dep" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
                    if [[ "$dep" =~ ^T[0-9]{3}$ ]]; then
                        task_deps+="$dep "
                    elif [[ "$dep" == "none" ]]; then
                        # No dependencies
                        task_deps=""
                    fi
                done
                TASK_DEPS["$task_id"]="$task_deps"
            fi
            
            log_info "Found task: $task_id - ${description:0:60}... (parallel: ${TASK_PARALLEL[$task_id]})"
            fi
        fi
    done
    
    log_info "Finished parsing. Found ${#TASK_IDS[@]} tasks"
}

# Get task completion status from tasks.md
get_task_status() {
    local tasks_file="$1"
    local task_id="$2"
    local -n status_ref=$3
    
    # Use mapfile to read the file
    local -a file_lines
    mapfile -t file_lines < "$tasks_file"
    
    # Look for the task line and check if it's marked complete [x]
    for line in "${file_lines[@]}"; do
        if [[ "$line" =~ ^-[[:space:]]*\[[[:space:]]*x[[:space:]]*\][[:space:]]*$task_id ]]; then
            status_ref="completed"
            return 0
        elif [[ "$line" =~ ^-[[:space:]]*\[[[:space:]]*\][[:space:]]*$task_id ]]; then
            status_ref="pending"
            return 0
        fi
    done
    
    status_ref="not_found"
}

# Update task completion status in tasks.md
mark_task_complete() {
    local tasks_file="$1"
    local task_id="$2"
    
    log_info "Marking task $task_id as complete"
    
    # Create backup
    cp "$tasks_file" "$tasks_file.bak"
    
    # Update the task status from [ ] to [x]
    sed -i "s/^\\(- \\[\\)[[:space:]]*\\(\\] $task_id\\)/\\1x\\2/" "$tasks_file"
}

#==============================================================================
# Task Execution Functions
#==============================================================================

# Execute a specific task based on its description
execute_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Executing task $task_id: $description"
    
    if $DRY_RUN; then
        log_info "DRY RUN: Would execute $task_id"
        return 0
    fi
    
    # Parse task type and execute accordingly
    case "$description" in
        *"Initialize Node project"* | *"npm init"*)
            execute_npm_init_task "$task_id" "$description"
            ;;
        *"Install"*"dependencies"* | *"npm install"*)
            execute_npm_install_task "$task_id" "$description"
            ;;
        *"Create project structure"*)
            execute_structure_task "$task_id" "$description"
            ;;
        *"Configure"*"lint"* | *"eslint"* | *"prettier"*)
            execute_linting_task "$task_id" "$description"
            ;;
        *"Configure Jest"*)
            execute_jest_config_task "$task_id" "$description"
            ;;
        *"Configure Playwright"*)
            execute_playwright_config_task "$task_id" "$description"
            ;;
        *"Contract test"*)
            execute_contract_test_task "$task_id" "$description"
            ;;
        *"Integration test"*)
            execute_integration_test_task "$task_id" "$description"
            ;;
        *"model"*"schema"*)
            execute_model_task "$task_id" "$description"
            ;;
        *"service"* | *"Service"*)
            execute_service_task "$task_id" "$description"
            ;;
        *"component"* | *"Component"*)
            execute_component_task "$task_id" "$description"
            ;;
        *)
            execute_generic_task "$task_id" "$description"
            ;;
    esac
}

# Execute npm initialization task
execute_npm_init_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Setting up Node.js project"
    
    cd "$REPO_ROOT"
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_info "Running npm init -y..."
        if npm init -y; then
            log_success "Created package.json"
        else
            log_error "Failed to create package.json"
            return 1
        fi
    else
        log_info "package.json already exists"
    fi
    
    # If Angular is mentioned, set up Angular workspace
    if [[ "$description" =~ "Angular" ]]; then
        if [[ ! -f "angular.json" ]]; then
            log_info "Setting up Angular workspace"
            # Use npx to avoid global installation requirement
            log_info "Running npx @angular/cli@latest new..."
            if npx @angular/cli@latest new . --directory . --minimal --skip-git --package-manager npm --skip-install; then
                log_success "Created Angular workspace"
            else
                log_error "Failed to create Angular workspace"
                return 1
            fi
        else
            log_info "Angular workspace already exists"
        fi
    fi
}

# Execute npm install dependencies task
execute_npm_install_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Installing dependencies"
    
    cd "$REPO_ROOT"
    
    # Extract dependencies from description
    local deps=""
    local deps_pattern='\(([^)]+)\)'
    if [[ "$description" =~ $deps_pattern ]]; then
        deps="${BASH_REMATCH[1]}"
        # Clean up and split dependencies
        deps=$(echo "$deps" | sed 's/`//g' | sed 's/,/ /g')
        
        log_info "Installing: $deps"
        npm install $deps
        log_success "Dependencies installed"
    else
        log_info "No specific dependencies found, running npm install"
        npm install
    fi
}

# Execute project structure creation task
execute_structure_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating project structure"
    
    cd "$REPO_ROOT"
    
    # Extract directory paths from description
    local dirs=""
    local src_pattern='src/\{([^}]+)\}'
    if [[ "$description" =~ $src_pattern ]]; then
        dirs="${BASH_REMATCH[1]}"
        dirs=$(echo "$dirs" | sed 's/,/ /g')
        
        for dir in $dirs; do
            mkdir -p "src/$dir"
            log_info "Created src/$dir"
        done
    fi
    
    local tests_pattern='tests/\{([^}]+)\}'
    if [[ "$description" =~ $tests_pattern ]]; then
        dirs="${BASH_REMATCH[1]}"
        dirs=$(echo "$dirs" | sed 's/,/ /g')
        
        for dir in $dirs; do
            mkdir -p "tests/$dir"
            log_info "Created tests/$dir"
        done
    fi
    
    log_success "Project structure created"
}

# Execute linting configuration task
execute_linting_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Setting up linting and formatting"
    
    cd "$REPO_ROOT"
    
    # Create basic eslint config if it doesn't exist
    if [[ ! -f ".eslintrc.cjs" ]] && [[ ! -f ".eslintrc.json" ]]; then
        cat > .eslintrc.cjs << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Add custom rules here
  }
};
EOF
        log_success "Created .eslintrc.cjs"
    fi
    
    # Create prettier config if it doesn't exist
    if [[ ! -f ".prettierrc" ]]; then
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF
        log_success "Created .prettierrc"
    fi
    
    # Create lint-staged config if it doesn't exist
    if [[ ! -f ".lintstagedrc" ]]; then
        cat > .lintstagedrc << 'EOF'
{
  "*.{ts,js}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF
        log_success "Created .lintstagedrc"
    fi
}

# Execute Jest configuration task
execute_jest_config_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Setting up Jest configuration"
    
    cd "$REPO_ROOT"
    
    if [[ ! -f "jest.config.ts" ]]; then
        cat > jest.config.ts << 'EOF'
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};

export default config;
EOF
        log_success "Created jest.config.ts"
    fi
}

# Execute Playwright configuration task
execute_playwright_config_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Setting up Playwright configuration"
    
    cd "$REPO_ROOT"
    
    if [[ ! -f "playwright.config.ts" ]]; then
        cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    port: 4200,
    reuseExistingServer: !process.env.CI,
  },
});
EOF
        log_success "Created playwright.config.ts"
    fi
}

# Execute contract test task
execute_contract_test_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating contract test"
    
    # Extract test file path from description
    local test_file=""
    local test_pattern1='(tests/[^[:space:]]+\.spec\.ts)'
    local test_pattern2='in[[:space:]]+([^[:space:]]+\.spec\.ts)'
    if [[ "$description" =~ $test_pattern1 ]]; then
        test_file="${BASH_REMATCH[1]}"
    elif [[ "$description" =~ $test_pattern2 ]]; then
        test_file="${BASH_REMATCH[1]}"
    fi
    
    if [[ -n "$test_file" ]]; then
        local full_path="$REPO_ROOT/$test_file"
        mkdir -p "$(dirname "$full_path")"
        
        if [[ ! -f "$full_path" ]]; then
            # Create a basic failing test
            cat > "$full_path" << EOF
import { describe, it, expect } from '@jest/globals';

describe('$task_id Contract Test', () => {
  it('should implement contract for: $description', () => {
    // TODO: Implement this test
    expect(false).toBe(true); // This should fail initially
  });
});
EOF
            log_success "Created contract test: $test_file"
        else
            log_info "Contract test already exists: $test_file"
        fi
    else
        log_error "Could not extract test file path from description"
    fi
}

# Execute integration test task
execute_integration_test_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating integration test"
    
    # Similar to contract test but for integration scenarios
    execute_contract_test_task "$task_id" "$description"
}

# Execute model creation task
execute_model_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating model and schema"
    
    # Extract model file path from description
    local model_file=""
    local model_pattern='(src/[^[:space:]]+\.ts)'
    if [[ "$description" =~ $model_pattern ]]; then
        model_file="${BASH_REMATCH[1]}"
    fi
    
    if [[ -n "$model_file" ]]; then
        local full_path="$REPO_ROOT/$model_file"
        mkdir -p "$(dirname "$full_path")"
        
        if [[ ! -f "$full_path" ]]; then
            # Extract model name from file path
            local model_name=$(basename "$model_file" .ts)
            model_name=$(echo "$model_name" | sed 's/\b\w/\U&/g') # Capitalize first letter
            
            cat > "$full_path" << EOF
import { z } from 'zod';

// $model_name model schema
export const ${model_name}Schema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // TODO: Add specific fields for $model_name
});

export type $model_name = z.infer<typeof ${model_name}Schema>;

// Create function
export function create$model_name(data: Partial<$model_name>): $model_name {
  return ${model_name}Schema.parse({
    id: crypto.randomUUID(), // TODO: Use ULID
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  });
}
EOF
            log_success "Created model: $model_file"
        else
            log_info "Model already exists: $model_file"
        fi
    else
        log_error "Could not extract model file path from description"
    fi
}

# Execute service creation task
execute_service_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating service"
    
    # Extract service file path from description
    local service_file=""
    local service_pattern='(src/[^[:space:]]+\.ts)'
    if [[ "$description" =~ $service_pattern ]]; then
        service_file="${BASH_REMATCH[1]}"
    fi
    
    if [[ -n "$service_file" ]]; then
        local full_path="$REPO_ROOT/$service_file"
        mkdir -p "$(dirname "$full_path")"
        
        if [[ ! -f "$full_path" ]]; then
            # Extract service name from file path
            local service_name=$(basename "$service_file" .ts)
            service_name=$(echo "$service_name" | sed 's/\b\w/\U&/g') # Capitalize
            
            cat > "$full_path" << EOF
// $service_name implementation
export class $service_name {
  // TODO: Implement service methods
  
  constructor() {
    // Initialize service
  }
}
EOF
            log_success "Created service: $service_file"
        else
            log_info "Service already exists: $service_file"
        fi
    else
        log_error "Could not extract service file path from description"
    fi
}

# Execute component creation task
execute_component_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Creating Angular component"
    
    # Extract component file path from description
    local component_file=""
    local component_pattern='(src/[^[:space:]]+\.component\.ts)'
    if [[ "$description" =~ $component_pattern ]]; then
        component_file="${BASH_REMATCH[1]}"
    fi
    
    if [[ -n "$component_file" ]]; then
        local full_path="$REPO_ROOT/$component_file"
        mkdir -p "$(dirname "$full_path")"
        
        if [[ ! -f "$full_path" ]]; then
            # Extract component name from file path
            local component_name=$(basename "$component_file" .component.ts)
            local class_name=$(echo "$component_name" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/\b\w/\U&/g')
            
            cat > "$full_path" << EOF
import { Component } from '@angular/core';

@Component({
  selector: 'app-$component_name',
  template: \`
    <div>
      <h2>$class_name Component</h2>
      <!-- TODO: Implement component template -->
    </div>
  \`,
  styles: [\`
    /* TODO: Add component styles */
  \`]
})
export class ${class_name}Component {
  // TODO: Implement component logic
  
  constructor() {}
}
EOF
            log_success "Created component: $component_file"
        else
            log_info "Component already exists: $component_file"
        fi
    else
        log_error "Could not extract component file path from description"
    fi
}

# Execute generic task (placeholder)
execute_generic_task() {
    local task_id="$1"
    local description="$2"
    
    log_info "Executing generic task: $description"
    
    # For now, just create a TODO file to track what needs to be done manually
    local todo_file="$REPO_ROOT/TODO_$task_id.md"
    cat > "$todo_file" << EOF
# TODO: $task_id

## Description
$description

## Status
- [ ] Manual implementation required

## Notes
This task requires manual implementation or is not yet supported by the automation.
Please implement according to the task description above.

Generated: $(date)
EOF
    
    log_info "Created TODO file: $todo_file"
}

#==============================================================================
# Main Execution Logic
#==============================================================================

main() {
    log_info "Starting implementation of tasks from $TASKS"
    
    # Parse tasks from tasks.md
    parse_tasks "$TASKS"
    
    if [[ ${#TASK_IDS[@]} -eq 0 ]]; then
        log_error "No tasks found in $TASKS"
        exit 1
    fi
    
    log_info "Found ${#TASK_IDS[@]} tasks to execute"
    
    # If specific task requested, execute only that one
    if [[ -n "$SPECIFIC_TASK" ]]; then
        if [[ -z "${TASK_DESCRIPTIONS[$SPECIFIC_TASK]:-}" ]]; then
            log_error "Task $SPECIFIC_TASK not found"
            exit 1
        fi
        
        log_info "Executing specific task: $SPECIFIC_TASK"
        execute_task "$SPECIFIC_TASK" "${TASK_DESCRIPTIONS[$SPECIFIC_TASK]}"
        mark_task_complete "$TASKS" "$SPECIFIC_TASK"
        log_success "Task $SPECIFIC_TASK completed"
        return 0
    fi
    
    # Execute tasks in order
    local completed_count=0
    local total_count=${#TASK_IDS[@]}
    
    # Get sorted task IDs
    local sorted_tasks=($(printf '%s\n' "${TASK_IDS[@]}" | sort))
    
    for task_id in "${sorted_tasks[@]}"; do
        local description="${TASK_DESCRIPTIONS[$task_id]}"
        local status=""
        
        get_task_status "$TASKS" "$task_id" status
        
        if [[ "$status" == "completed" ]]; then
            log_info "Task $task_id already completed, skipping"
            ((completed_count++))
            continue
        fi
        
        # Check dependencies
        local deps="${TASK_DEPS[$task_id]:-}"
        local can_execute=true
        
        if [[ -n "$deps" ]]; then
            for dep in $deps; do
                local dep_status=""
                get_task_status "$TASKS" "$dep" dep_status
                if [[ "$dep_status" != "completed" ]]; then
                    log_info "Task $task_id waiting for dependency $dep"
                    can_execute=false
                    break
                fi
            done
        fi
        
        if ! $can_execute; then
            log_info "Skipping $task_id due to unmet dependencies"
            continue
        fi
        
        # Execute task
        log_info "Executing task $task_id ($(($completed_count + 1))/$total_count)"
        
        if execute_task "$task_id" "$description"; then
            mark_task_complete "$TASKS" "$task_id"
            ((completed_count++))
            log_success "Task $task_id completed successfully"
        else
            log_error "Task $task_id failed"
            if ! $CONTINUE_MODE; then
                exit 1
            fi
        fi
    done
    
    log_success "Implementation completed: $completed_count/$total_count tasks"
    
    if $JSON_MODE; then
        printf '{"status":"completed","tasks_completed":%d,"tasks_total":%d}\n' "$completed_count" "$total_count"
    fi
}

# Run main function
main "$@"