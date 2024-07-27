{ pkgs }: {
	deps = [
   pkgs.rustup
   pkgs.solana-testnet
   pkgs.unzip
		pkgs.nodejs-18_x
		pkgs.nodePackages.typescript-language-server
		pkgs.yarn
		pkgs.replitPackages.jest
	];
}