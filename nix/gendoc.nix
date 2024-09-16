{ lib, stdenv, gcc, fetchFromGitLab }:
stdenv.mkDerivation {
  name = "gendoc";
  version = "1.0.0";

  src = fetchFromGitLab {
    owner = "bztsrc";
    repo = "gendoc";
    rev = "0d6d3621a7ee6e7c20b202e78eaa07ee25381c3e";
    hash = "sha256-zf//XEiYykLsHpsTX/IeMF0gqMo50zFM4wrKiL/ZtxM=";
  };

  # Building
  buildInputs = [ ];

  buildPhase = ''
    mkdir -p $out/bin
    ${gcc}/bin/gcc gendoc.c -o $out/bin/gendoc
  '';
}
