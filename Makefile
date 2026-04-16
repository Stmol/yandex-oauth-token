.PHONY: build build-unsigned clean sign-macos

BUILD_OUTFILE := ./build/yandex-auth-token
CODESIGN_ENTITLEMENTS := ./entitlements.plist

build: build-unsigned sign-macos

build-unsigned:
	mkdir -p build
	bun build --compile ./server.js --outfile $(BUILD_OUTFILE)

clean:
	find . -type f -name '*.bun-build' -delete

sign-macos:
	@if [ "$$(uname -s)" != "Darwin" ]; then \
		exit 0; \
	fi
	@if [ -z "$(CODESIGN_IDENTITY)" ]; then \
		printf '%s\n' 'error: macOS blocks unsigned Bun standalone executables.'; \
		printf '%s\n' 'Set CODESIGN_IDENTITY to a valid signing identity and rerun make build.'; \
		printf '%s\n' 'List available identities with: security find-identity -v -p codesigning'; \
		printf '%s\n' 'If you only need the raw artifact for inspection, use: make build-unsigned'; \
		exit 1; \
	fi
	codesign --deep --force --sign "$(CODESIGN_IDENTITY)" --entitlements "$(CODESIGN_ENTITLEMENTS)" "$(BUILD_OUTFILE)"
	codesign -vvv --verify "$(BUILD_OUTFILE)"
