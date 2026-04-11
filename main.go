package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type Module struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Author      string            `json:"author"`
	Hooks       map[string]string `json:"hooks"`
	Schemas     map[string]any    `json:"schemas"`
}

type ModuleListResponse struct {
	Modules []ModuleInfo `json:"modules"`
}

type ModuleInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Author      string `json:"author"`
}

var modulesPath = "./modules"

func main() {
	modulesPath = os.Getenv("MODULES_PATH")
	if modulesPath == "" {
		dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
		modulesPath = filepath.Join(dir, "modules")
		if _, err := os.Stat(modulesPath); os.IsNotExist(err) {
			modulesPath = "./modules"
		}
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/modules", listModules)
	mux.HandleFunc("/api/modules/", handleModuleAction)

	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("public"))))

	// mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	if r.URL.Path != "/" {
	// 		http.NotFound(w, r)
	// 		return
	// 	}
	// 	http.ServeFile(w, r, "public/index.html")
	// })

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on http://localhost:%s\n", port)
	fmt.Printf("Modules path: %s\n", modulesPath)
	http.ListenAndServe(":"+port, mux)
}

func listModules(w http.ResponseWriter, r *http.Request) {
	manifestPath := filepath.Join(modulesPath, "manifest.json")
	data, err := os.ReadFile(manifestPath)
	if err != nil {
		http.Error(w, "Failed to read manifest.json", 500)
		return
	}

	var resp ModuleListResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		http.Error(w, "Failed to parse manifest.json", 500)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

func handleModuleAction(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/modules/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) < 2 {
		http.Error(w, "Invalid path", 400)
		return
	}
	id := parts[0] + "/" + parts[1]

	filePath := filepath.Join(modulesPath, id+".js")
	if _, err := os.Stat(filePath); err != nil {
		http.Error(w, "Not found", 404)
		return
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "Failed to read file", 500)
		return
	}

	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.js", id))
	w.Write(data)
}
