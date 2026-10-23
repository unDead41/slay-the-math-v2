/* Loaded after Config, Artifact and Economy data; before their consumers. */
(function(root){'use strict';const b=root.STMBalance;if(b){b.configure(root.DCConfig);root.DCArtifactData=b.artifactData();root.STMEconomyData=b.economyData(root.STMEconomyData);root.DCRichTextData=b.richTextData(root.DCRichTextData);}})(globalThis);
