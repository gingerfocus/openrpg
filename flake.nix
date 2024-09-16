{
  description = "web app for dawn character sheets";

  inputs.nixpkgs.url = "nixpkgs"; # use the system nixpkgs if not locked

  outputs = { self, nixpkgs }:
    let
      lib = nixpkgs.lib;
      systems = [ "aarch64-linux" "x86_64-linux" ];
      eachSystem = f:
        lib.foldAttrs lib.mergeAttrs { }
        (map (s: lib.mapAttrs (_: v: { ${s} = v; }) (f s)) systems);
    in eachSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            (final: prev: {
              gendoc = (prev.callPackage ./nix/gendoc.nix {});
            })
          ];
        };
        mkShellApp = name: script:
          let drv = pkgs.writeShellScriptBin name script;
          in mkApp drv;
        mkApp = drv:
          let name = drv.pname or drv.name;
          in {
            type = "app";
            program = "${drv}/bin/${name}";
          };
      in {
        # Executed by `nix run .#<name>`
        apps = rec {
          default = serve;
          serve = mkShellApp "opendawn-serve" ''
            ${pkgs.python3}/bin/python3 -m http.server -d public
          '';
          docs = mkShellApp "opendawn-docs" ''
            ${pkgs.gendoc}/bin/gendoc public/docs/index.html docs/index.md
          '';
        };

        packages.gendoc = pkgs.gendoc;

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [ nodejs typescript firebase-tools ];

          env = { };

          # shellHook = '''';
        };
      });
}
