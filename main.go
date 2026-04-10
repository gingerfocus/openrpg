package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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

var modulesPath string

func main() {
	modulesPath = os.Getenv("MODULES_PATH")
	if modulesPath == "" {
		dir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
		modulesPath = filepath.Join(dir, "modules")
		if _, err := os.Stat(modulesPath); os.IsNotExist(err) {
			modulesPath = "./modules"
		}
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "public/index.html")
	})

	r.Route("/api", func(r chi.Router) {
		r.Get("/modules", listModules)
		r.Get("/modules/{id}", getModule)
		r.Get("/modules/{id}/download", downloadModule)
		r.Get("/modules/{id}/template", getTemplate)
	})

	r.Handle("/*", http.StripPrefix("", http.FileServer(http.Dir("public"))))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on http://localhost:%s\n", port)
	fmt.Printf("Modules path: %s\n", modulesPath)
	http.ListenAndServe(":"+port, r)
}

func listModules(w http.ResponseWriter, r *http.Request) {
	entries, err := os.ReadDir(modulesPath)
	if err != nil {
		http.Error(w, "Failed to read modules", 500)
		return
	}

	var modules []ModuleInfo
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		manifestPath := filepath.Join(modulesPath, entry.Name(), "module.json")
		data, err := os.ReadFile(manifestPath)
		if err != nil {
			continue
		}

		var m Module
		if err := json.Unmarshal(data, &m); err != nil {
			continue
		}

		modules = append(modules, ModuleInfo{
			ID:          m.ID,
			Name:        m.Name,
			Version:     m.Version,
			Description: m.Description,
			Author:      m.Author,
		})
	}

	json.NewEncoder(w).Encode(ModuleListResponse{Modules: modules})
}

func getModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	manifestPath := filepath.Join(modulesPath, id, "module.json")

	data, err := os.ReadFile(manifestPath)
	if err != nil {
		http.Error(w, "Module not found", 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func downloadModule(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	bundlePath := filepath.Join(modulesPath, id, "bundle.js")

	data, err := os.ReadFile(bundlePath)
	if err != nil {
		http.Error(w, "Bundle not found", 404)
		return
	}

	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s-bundle.js", id))
	w.Write(data)
}

func getTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	templatePath := filepath.Join(modulesPath, id, "template.json")

	data, err := os.ReadFile(templatePath)
	if err != nil {
		http.Error(w, "Template not found", 404)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}
