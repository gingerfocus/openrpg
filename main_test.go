package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestModuleManifests(t *testing.T) {
	manifestData, err := os.ReadFile(modulesPath + "/manifest.json")
	if err != nil {
		t.Skipf("manifest.json not found: %v", err)
	}

	var resp ModuleListResponse
	if err := json.Unmarshal(manifestData, &resp); err != nil {
		t.Errorf("manifest.json is not valid JSON: %v", err)
		return
	}

	if len(resp.Modules) == 0 {
		t.Errorf("no modules found in manifest.json")
	}

	for _, m := range resp.Modules {
		t.Run(m.ID, func(t *testing.T) {
			if m.ID == "" {
				t.Errorf("module missing required field: id")
			}
			if m.Name == "" {
				t.Errorf("module missing required field: name")
			}
			if m.Version == "" {
				t.Errorf("module missing required field: version")
			}

			bundlePath := modulesPath + "/" + m.ID + ".js"
			bundleData, err := os.ReadFile(bundlePath)
			if err != nil {
				t.Errorf("module bundle %s.js not found", m.ID)
				return
			}

			if len(bundleData) == 0 {
				t.Errorf("module bundle %s.js is empty", m.ID)
			}
		})
	}
}

func TestModuleDiscovery(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/modules", nil)
	rr := httptest.NewRecorder()
	listModules(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("listModules returned status %d", rr.Code)
		return
	}

	var resp ModuleListResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Errorf("listModules response is not valid JSON: %v", err)
		return
	}

	found := make(map[string]bool)
	for _, m := range resp.Modules {
		found[m.ID] = true
	}

	expected := []string{"@core/inventory", "@core/stats", "@focus/dawn", "@focus/shadowdark"}
	for _, id := range expected {
		if !found[id] {
			t.Errorf("expected module %q not found in discovery response", id)
		}
	}
}

func TestModuleAPIRouting(t *testing.T) {
	tests := []struct {
		name       string
		path       string
		wantStatus int
		wantType   string
	}{
		{
			name:       "@core/inventory",
			path:       "/api/modules/@core/inventory",
			wantStatus: http.StatusOK,
			wantType:   "application/javascript",
		},
		{
			name:       "@core/stats",
			path:       "/api/modules/@core/stats",
			wantStatus: http.StatusOK,
			wantType:   "application/javascript",
		},
		{
			name:       "@focus/dawn",
			path:       "/api/modules/@focus/dawn",
			wantStatus: http.StatusOK,
			wantType:   "application/javascript",
		},
		{
			name:       "@focus/shadowdark",
			path:       "/api/modules/@focus/shadowdark",
			wantStatus: http.StatusOK,
			wantType:   "application/javascript",
		},
		{
			name:       "nonexistent module",
			path:       "/api/modules/@core/nonexistent",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", tt.path, nil)
			rr := httptest.NewRecorder()
			handleModuleAction(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("got status %d, want %d", rr.Code, tt.wantStatus)
			}

			if tt.wantType != "" && !strings.Contains(rr.Header().Get("Content-Type"), tt.wantType) {
				t.Errorf("got content-type %s, want %s", rr.Header().Get("Content-Type"), tt.wantType)
			}
		})
	}
}
