#!/usr/bin/env esno

import { runCommitProcessing } from "./commit-message-formatter";

(async () => {
  await runCommitProcessing();
})();
