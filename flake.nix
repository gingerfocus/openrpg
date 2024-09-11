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
      let pkgs = import nixpkgs {
        inherit system;
        overlays = [ (final: prev: { }) ];
      };
      in {
        devShells.default = pkgs.stdenv.mkDerivation {
          name = "opendawn";
          nativeBuildInputs = with pkgs; [ nodejs typescript firebase-tools ];
          buildInputs = with pkgs; [ ];

          # shellHook = '''';
        };
      });
}
