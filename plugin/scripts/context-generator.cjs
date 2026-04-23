"use strict";var Lt=Object.create;var F=Object.defineProperty;var vt=Object.getOwnPropertyDescriptor;var yt=Object.getOwnPropertyNames;var Dt=Object.getPrototypeOf,Mt=Object.prototype.hasOwnProperty;var Ut=(r,e)=>{for(var s in e)F(r,s,{get:e[s],enumerable:!0})},ge=(r,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of yt(e))!Mt.call(r,n)&&n!==s&&F(r,n,{get:()=>e[n],enumerable:!(t=vt(e,n))||t.enumerable});return r};var L=(r,e,s)=>(s=r!=null?Lt(Dt(r)):{},ge(e||!r||!r.__esModule?F(s,"default",{value:r,enumerable:!0}):s,r)),xt=r=>ge(F({},"__esModule",{value:!0}),r);var es={};Ut(es,{generateContext:()=>le});module.exports=xt(es);var Rt=L(require("path"),1),It=require("os"),Nt=require("fs");var Ie=require("bun:sqlite");var f=require("path"),ee=require("os"),P=require("fs");var Se=require("url");var C=require("fs"),D=require("path"),fe=require("os"),Q=(o=>(o[o.DEBUG=0]="DEBUG",o[o.INFO=1]="INFO",o[o.WARN=2]="WARN",o[o.ERROR=3]="ERROR",o[o.SILENT=4]="SILENT",o))(Q||{}),Te=(0,D.join)((0,fe.homedir)(),".claude-mem"),Z=class{level=null;useColor;logFilePath=null;logFileInitialized=!1;constructor(){this.useColor=process.stdout.isTTY??!1}ensureLogFileInitialized(){if(!this.logFileInitialized){this.logFileInitialized=!0;try{let e=(0,D.join)(Te,"logs");(0,C.existsSync)(e)||(0,C.mkdirSync)(e,{recursive:!0});let s=new Date().toISOString().split("T")[0];this.logFilePath=(0,D.join)(e,`claude-mem-${s}.log`)}catch(e){console.error("[LOGGER] Failed to initialize log file:",e),this.logFilePath=null}}}getLevel(){if(this.level===null)try{let e=(0,D.join)(Te,"settings.json");if((0,C.existsSync)(e)){let s=(0,C.readFileSync)(e,"utf-8"),n=(JSON.parse(s).CLAUDE_MEM_LOG_LEVEL||"INFO").toUpperCase();this.level=Q[n]??1}else this.level=1}catch{this.level=1}return this.level}correlationId(e,s){return`obs-${e}-${s}`}sessionId(e){return`session-${e}`}formatData(e){if(e==null)return"";if(typeof e=="string")return e;if(typeof e=="number"||typeof e=="boolean")return e.toString();if(typeof e=="object"){if(e instanceof Error)return this.getLevel()===0?`${e.message}
${e.stack}`:e.message;if(Array.isArray(e))return`[${e.length} items]`;let s=Object.keys(e);return s.length===0?"{}":s.length<=3?JSON.stringify(e):`{${s.length} keys: ${s.slice(0,3).join(", ")}...}`}return String(e)}formatTool(e,s){if(!s)return e;let t=s;if(typeof s=="string")try{t=JSON.parse(s)}catch{t=s}if(e==="Bash"&&t.command)return`${e}(${t.command})`;if(t.file_path)return`${e}(${t.file_path})`;if(t.notebook_path)return`${e}(${t.notebook_path})`;if(e==="Glob"&&t.pattern)return`${e}(${t.pattern})`;if(e==="Grep"&&t.pattern)return`${e}(${t.pattern})`;if(t.url)return`${e}(${t.url})`;if(t.query)return`${e}(${t.query})`;if(e==="Task"){if(t.subagent_type)return`${e}(${t.subagent_type})`;if(t.description)return`${e}(${t.description})`}return e==="Skill"&&t.skill?`${e}(${t.skill})`:e==="LSP"&&t.operation?`${e}(${t.operation})`:e}formatTimestamp(e){let s=e.getFullYear(),t=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0"),o=String(e.getHours()).padStart(2,"0"),i=String(e.getMinutes()).padStart(2,"0"),a=String(e.getSeconds()).padStart(2,"0"),d=String(e.getMilliseconds()).padStart(3,"0");return`${s}-${t}-${n} ${o}:${i}:${a}.${d}`}log(e,s,t,n,o){if(e<this.getLevel())return;this.ensureLogFileInitialized();let i=this.formatTimestamp(new Date),a=Q[e].padEnd(5),d=s.padEnd(6),m="";n?.correlationId?m=`[${n.correlationId}] `:n?.sessionId&&(m=`[session-${n.sessionId}] `);let c="";o!=null&&(o instanceof Error?c=this.getLevel()===0?`
${o.message}
${o.stack}`:` ${o.message}`:this.getLevel()===0&&typeof o=="object"?c=`
`+JSON.stringify(o,null,2):c=" "+this.formatData(o));let l="";if(n){let{sessionId:T,memorySessionId:O,correlationId:S,...p}=n;Object.keys(p).length>0&&(l=` {${Object.entries(p).map(([g,b])=>`${g}=${b}`).join(", ")}}`)}let E=`[${i}] [${a}] [${d}] ${m}${t}${l}${c}`;if(this.logFilePath)try{(0,C.appendFileSync)(this.logFilePath,E+`
`,"utf8")}catch(T){process.stderr.write(`[LOGGER] Failed to write to log file: ${T}
`)}else process.stderr.write(E+`
`)}debug(e,s,t,n){this.log(0,e,s,t,n)}info(e,s,t,n){this.log(1,e,s,t,n)}warn(e,s,t,n){this.log(2,e,s,t,n)}error(e,s,t,n){this.log(3,e,s,t,n)}dataIn(e,s,t,n){this.info(e,`\u2192 ${s}`,t,n)}dataOut(e,s,t,n){this.info(e,`\u2190 ${s}`,t,n)}success(e,s,t,n){this.info(e,`\u2713 ${s}`,t,n)}failure(e,s,t,n){this.error(e,`\u2717 ${s}`,t,n)}timing(e,s,t,n){this.info(e,`\u23F1 ${s}`,n,{duration:`${t}ms`})}happyPathError(e,s,t,n,o=""){let m=((new Error().stack||"").split(`
`)[2]||"").match(/at\s+(?:.*\s+)?\(?([^:]+):(\d+):(\d+)\)?/),c=m?`${m[1].split("/").pop()}:${m[2]}`:"unknown",l={...t,location:c};return this.warn(e,`[HAPPY-PATH] ${s}`,l,n),o}},_=new Z;var Ft={};function kt(){return typeof __dirname<"u"?__dirname:(0,f.dirname)((0,Se.fileURLToPath)(Ft.url))}var $t=kt();function wt(){if(process.env.CLAUDE_MEM_DATA_DIR)return process.env.CLAUDE_MEM_DATA_DIR;let r=(0,f.join)((0,ee.homedir)(),".claude-mem"),e=(0,f.join)(r,"settings.json");try{if((0,P.existsSync)(e)){let{readFileSync:s}=require("fs"),t=JSON.parse(s(e,"utf-8")),n=t.env??t;if(n.CLAUDE_MEM_DATA_DIR)return n.CLAUDE_MEM_DATA_DIR}}catch{}return r}var I=wt(),v=process.env.CLAUDE_CONFIG_DIR||(0,f.join)((0,ee.homedir)(),".claude"),os=(0,f.join)(v,"plugins","marketplaces","thedotmack"),is=(0,f.join)(I,"archives"),as=(0,f.join)(I,"logs"),ds=(0,f.join)(I,"trash"),us=(0,f.join)(I,"backups"),ms=(0,f.join)(I,"modes"),cs=(0,f.join)(I,"settings.json"),be=(0,f.join)(I,"claude-mem.db"),_s=(0,f.join)(I,"vector-db"),ps=(0,f.join)(I,"observer-sessions"),ls=(0,f.join)(v,"settings.json"),Es=(0,f.join)(v,"commands"),gs=(0,f.join)(v,"CLAUDE.md");function he(r){(0,P.mkdirSync)(r,{recursive:!0})}function Oe(){return(0,f.join)($t,"..")}var Ae=require("crypto");var Pt=3e4;function H(r,e,s){return(0,Ae.createHash)("sha256").update([r||"",e||"",s||""].join("\0")).digest("hex").slice(0,16)}function j(r,e,s){let t=s-Pt;return r.prepare("SELECT id, created_at_epoch FROM observations WHERE content_hash = ? AND created_at_epoch > ?").get(e,t)}function te(r){if(!r)return[];try{let e=JSON.parse(r);return Array.isArray(e)?e:[String(e)]}catch{return[r]}}var h="claude";function Ht(r){return r.trim().toLowerCase().replace(/\s+/g,"-")}function y(r){if(!r)return h;let e=Ht(r);return e?e==="transcript"||e.includes("codex")?"codex":e.includes("cursor")?"cursor":e.includes("claude")?"claude":e:h}function Re(r){let e=["claude","codex","cursor"];return[...r].sort((s,t)=>{let n=e.indexOf(s),o=e.indexOf(t);return n!==-1||o!==-1?n===-1?1:o===-1?-1:n-o:s.localeCompare(t)})}function jt(r,e){return{customTitle:r,platformSource:e?y(e):void 0}}var X=class{db;constructor(e=be){e!==":memory:"&&he(I),this.db=new Ie.Database(e),this.db.run("PRAGMA journal_mode = WAL"),this.db.run("PRAGMA synchronous = NORMAL"),this.db.run("PRAGMA foreign_keys = ON"),this.initializeSchema(),this.ensureWorkerPortColumn(),this.ensurePromptTrackingColumns(),this.removeSessionSummariesUniqueConstraint(),this.addObservationHierarchicalFields(),this.makeObservationsTextNullable(),this.createUserPromptsTable(),this.ensureDiscoveryTokensColumn(),this.createPendingMessagesTable(),this.renameSessionIdColumns(),this.repairSessionIdColumnRename(),this.addFailedAtEpochColumn(),this.addOnUpdateCascadeToForeignKeys(),this.addObservationContentHashColumn(),this.addSessionCustomTitleColumn(),this.addSessionPlatformSourceColumn(),this.addObservationModelColumns()}initializeSchema(){this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_versions (
        id INTEGER PRIMARY KEY,
        version INTEGER UNIQUE NOT NULL,
        applied_at TEXT NOT NULL
      )
    `),this.db.run(`
      CREATE TABLE IF NOT EXISTS sdk_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_session_id TEXT UNIQUE NOT NULL,
        memory_session_id TEXT UNIQUE,
        project TEXT NOT NULL,
        platform_source TEXT NOT NULL DEFAULT 'claude',
        user_prompt TEXT,
        started_at TEXT NOT NULL,
        started_at_epoch INTEGER NOT NULL,
        completed_at TEXT,
        completed_at_epoch INTEGER,
        status TEXT CHECK(status IN ('active', 'completed', 'failed')) NOT NULL DEFAULT 'active'
      );

      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_claude_id ON sdk_sessions(content_session_id);
      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_sdk_id ON sdk_sessions(memory_session_id);
      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_project ON sdk_sessions(project);
      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_status ON sdk_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_started ON sdk_sessions(started_at_epoch DESC);

      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_session_id TEXT NOT NULL,
        project TEXT NOT NULL,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_at_epoch INTEGER NOT NULL,
        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_observations_sdk_session ON observations(memory_session_id);
      CREATE INDEX IF NOT EXISTS idx_observations_project ON observations(project);
      CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
      CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at_epoch DESC);

      CREATE TABLE IF NOT EXISTS session_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_session_id TEXT UNIQUE NOT NULL,
        project TEXT NOT NULL,
        request TEXT,
        investigated TEXT,
        learned TEXT,
        completed TEXT,
        next_steps TEXT,
        files_read TEXT,
        files_edited TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        created_at_epoch INTEGER NOT NULL,
        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_session_summaries_sdk_session ON session_summaries(memory_session_id);
      CREATE INDEX IF NOT EXISTS idx_session_summaries_project ON session_summaries(project);
      CREATE INDEX IF NOT EXISTS idx_session_summaries_created ON session_summaries(created_at_epoch DESC);
    `),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(4,new Date().toISOString())}ensureWorkerPortColumn(){this.db.query("PRAGMA table_info(sdk_sessions)").all().some(t=>t.name==="worker_port")||(this.db.run("ALTER TABLE sdk_sessions ADD COLUMN worker_port INTEGER"),_.debug("DB","Added worker_port column to sdk_sessions table")),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(5,new Date().toISOString())}ensurePromptTrackingColumns(){this.db.query("PRAGMA table_info(sdk_sessions)").all().some(a=>a.name==="prompt_counter")||(this.db.run("ALTER TABLE sdk_sessions ADD COLUMN prompt_counter INTEGER DEFAULT 0"),_.debug("DB","Added prompt_counter column to sdk_sessions table")),this.db.query("PRAGMA table_info(observations)").all().some(a=>a.name==="prompt_number")||(this.db.run("ALTER TABLE observations ADD COLUMN prompt_number INTEGER"),_.debug("DB","Added prompt_number column to observations table")),this.db.query("PRAGMA table_info(session_summaries)").all().some(a=>a.name==="prompt_number")||(this.db.run("ALTER TABLE session_summaries ADD COLUMN prompt_number INTEGER"),_.debug("DB","Added prompt_number column to session_summaries table")),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(6,new Date().toISOString())}removeSessionSummariesUniqueConstraint(){if(!this.db.query("PRAGMA index_list(session_summaries)").all().some(t=>t.unique===1&&t.origin!=="pk")){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(7,new Date().toISOString());return}_.debug("DB","Removing UNIQUE constraint from session_summaries.memory_session_id"),this.db.run("BEGIN TRANSACTION"),this.db.run("DROP TABLE IF EXISTS session_summaries_new"),this.db.run(`
      CREATE TABLE session_summaries_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_session_id TEXT NOT NULL,
        project TEXT NOT NULL,
        request TEXT,
        investigated TEXT,
        learned TEXT,
        completed TEXT,
        next_steps TEXT,
        files_read TEXT,
        files_edited TEXT,
        notes TEXT,
        prompt_number INTEGER,
        created_at TEXT NOT NULL,
        created_at_epoch INTEGER NOT NULL,
        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE
      )
    `),this.db.run(`
      INSERT INTO session_summaries_new
      SELECT id, memory_session_id, project, request, investigated, learned,
             completed, next_steps, files_read, files_edited, notes,
             prompt_number, created_at, created_at_epoch
      FROM session_summaries
    `),this.db.run("DROP TABLE session_summaries"),this.db.run("ALTER TABLE session_summaries_new RENAME TO session_summaries"),this.db.run(`
      CREATE INDEX idx_session_summaries_sdk_session ON session_summaries(memory_session_id);
      CREATE INDEX idx_session_summaries_project ON session_summaries(project);
      CREATE INDEX idx_session_summaries_created ON session_summaries(created_at_epoch DESC);
    `),this.db.run("COMMIT"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(7,new Date().toISOString()),_.debug("DB","Successfully removed UNIQUE constraint from session_summaries.memory_session_id")}addObservationHierarchicalFields(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(8))return;if(this.db.query("PRAGMA table_info(observations)").all().some(n=>n.name==="title")){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(8,new Date().toISOString());return}_.debug("DB","Adding hierarchical fields to observations table"),this.db.run(`
      ALTER TABLE observations ADD COLUMN title TEXT;
      ALTER TABLE observations ADD COLUMN subtitle TEXT;
      ALTER TABLE observations ADD COLUMN facts TEXT;
      ALTER TABLE observations ADD COLUMN narrative TEXT;
      ALTER TABLE observations ADD COLUMN concepts TEXT;
      ALTER TABLE observations ADD COLUMN files_read TEXT;
      ALTER TABLE observations ADD COLUMN files_modified TEXT;
    `),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(8,new Date().toISOString()),_.debug("DB","Successfully added hierarchical fields to observations table")}makeObservationsTextNullable(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(9))return;let t=this.db.query("PRAGMA table_info(observations)").all().find(n=>n.name==="text");if(!t||t.notnull===0){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(9,new Date().toISOString());return}_.debug("DB","Making observations.text nullable"),this.db.run("BEGIN TRANSACTION"),this.db.run("DROP TABLE IF EXISTS observations_new"),this.db.run(`
      CREATE TABLE observations_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_session_id TEXT NOT NULL,
        project TEXT NOT NULL,
        text TEXT,
        type TEXT NOT NULL,
        title TEXT,
        subtitle TEXT,
        facts TEXT,
        narrative TEXT,
        concepts TEXT,
        files_read TEXT,
        files_modified TEXT,
        prompt_number INTEGER,
        created_at TEXT NOT NULL,
        created_at_epoch INTEGER NOT NULL,
        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE
      )
    `),this.db.run(`
      INSERT INTO observations_new
      SELECT id, memory_session_id, project, text, type, title, subtitle, facts,
             narrative, concepts, files_read, files_modified, prompt_number,
             created_at, created_at_epoch
      FROM observations
    `),this.db.run("DROP TABLE observations"),this.db.run("ALTER TABLE observations_new RENAME TO observations"),this.db.run(`
      CREATE INDEX idx_observations_sdk_session ON observations(memory_session_id);
      CREATE INDEX idx_observations_project ON observations(project);
      CREATE INDEX idx_observations_type ON observations(type);
      CREATE INDEX idx_observations_created ON observations(created_at_epoch DESC);
    `),this.db.run("COMMIT"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(9,new Date().toISOString()),_.debug("DB","Successfully made observations.text nullable")}createUserPromptsTable(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(10))return;if(this.db.query("PRAGMA table_info(user_prompts)").all().length>0){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(10,new Date().toISOString());return}_.debug("DB","Creating user_prompts table with FTS5 support"),this.db.run("BEGIN TRANSACTION"),this.db.run(`
      CREATE TABLE user_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_session_id TEXT NOT NULL,
        prompt_number INTEGER NOT NULL,
        prompt_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_at_epoch INTEGER NOT NULL,
        FOREIGN KEY(content_session_id) REFERENCES sdk_sessions(content_session_id) ON DELETE CASCADE
      );

      CREATE INDEX idx_user_prompts_claude_session ON user_prompts(content_session_id);
      CREATE INDEX idx_user_prompts_created ON user_prompts(created_at_epoch DESC);
      CREATE INDEX idx_user_prompts_prompt_number ON user_prompts(prompt_number);
      CREATE INDEX idx_user_prompts_lookup ON user_prompts(content_session_id, prompt_number);
    `);try{this.db.run(`
        CREATE VIRTUAL TABLE user_prompts_fts USING fts5(
          prompt_text,
          content='user_prompts',
          content_rowid='id'
        );
      `),this.db.run(`
        CREATE TRIGGER user_prompts_ai AFTER INSERT ON user_prompts BEGIN
          INSERT INTO user_prompts_fts(rowid, prompt_text)
          VALUES (new.id, new.prompt_text);
        END;

        CREATE TRIGGER user_prompts_ad AFTER DELETE ON user_prompts BEGIN
          INSERT INTO user_prompts_fts(user_prompts_fts, rowid, prompt_text)
          VALUES('delete', old.id, old.prompt_text);
        END;

        CREATE TRIGGER user_prompts_au AFTER UPDATE ON user_prompts BEGIN
          INSERT INTO user_prompts_fts(user_prompts_fts, rowid, prompt_text)
          VALUES('delete', old.id, old.prompt_text);
          INSERT INTO user_prompts_fts(rowid, prompt_text)
          VALUES (new.id, new.prompt_text);
        END;
      `)}catch(t){_.warn("DB","FTS5 not available \u2014 user_prompts_fts skipped (search uses ChromaDB)",{},t)}this.db.run("COMMIT"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(10,new Date().toISOString()),_.debug("DB","Successfully created user_prompts table")}ensureDiscoveryTokensColumn(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(11))return;this.db.query("PRAGMA table_info(observations)").all().some(i=>i.name==="discovery_tokens")||(this.db.run("ALTER TABLE observations ADD COLUMN discovery_tokens INTEGER DEFAULT 0"),_.debug("DB","Added discovery_tokens column to observations table")),this.db.query("PRAGMA table_info(session_summaries)").all().some(i=>i.name==="discovery_tokens")||(this.db.run("ALTER TABLE session_summaries ADD COLUMN discovery_tokens INTEGER DEFAULT 0"),_.debug("DB","Added discovery_tokens column to session_summaries table")),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(11,new Date().toISOString())}createPendingMessagesTable(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(16))return;if(this.db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='pending_messages'").all().length>0){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(16,new Date().toISOString());return}_.debug("DB","Creating pending_messages table"),this.db.run(`
      CREATE TABLE pending_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_db_id INTEGER NOT NULL,
        content_session_id TEXT NOT NULL,
        message_type TEXT NOT NULL CHECK(message_type IN ('observation', 'summarize')),
        tool_name TEXT,
        tool_input TEXT,
        tool_response TEXT,
        cwd TEXT,
        last_user_message TEXT,
        last_assistant_message TEXT,
        prompt_number INTEGER,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'processed', 'failed')),
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at_epoch INTEGER NOT NULL,
        started_processing_at_epoch INTEGER,
        completed_at_epoch INTEGER,
        FOREIGN KEY (session_db_id) REFERENCES sdk_sessions(id) ON DELETE CASCADE
      )
    `),this.db.run("CREATE INDEX IF NOT EXISTS idx_pending_messages_session ON pending_messages(session_db_id)"),this.db.run("CREATE INDEX IF NOT EXISTS idx_pending_messages_status ON pending_messages(status)"),this.db.run("CREATE INDEX IF NOT EXISTS idx_pending_messages_claude_session ON pending_messages(content_session_id)"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(16,new Date().toISOString()),_.debug("DB","pending_messages table created successfully")}renameSessionIdColumns(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(17))return;_.debug("DB","Checking session ID columns for semantic clarity rename");let s=0,t=(n,o,i)=>{let a=this.db.query(`PRAGMA table_info(${n})`).all(),d=a.some(c=>c.name===o);return a.some(c=>c.name===i)?!1:d?(this.db.run(`ALTER TABLE ${n} RENAME COLUMN ${o} TO ${i}`),_.debug("DB",`Renamed ${n}.${o} to ${i}`),!0):(_.warn("DB",`Column ${o} not found in ${n}, skipping rename`),!1)};t("sdk_sessions","claude_session_id","content_session_id")&&s++,t("sdk_sessions","sdk_session_id","memory_session_id")&&s++,t("pending_messages","claude_session_id","content_session_id")&&s++,t("observations","sdk_session_id","memory_session_id")&&s++,t("session_summaries","sdk_session_id","memory_session_id")&&s++,t("user_prompts","claude_session_id","content_session_id")&&s++,this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(17,new Date().toISOString()),s>0?_.debug("DB",`Successfully renamed ${s} session ID columns`):_.debug("DB","No session ID column renames needed (already up to date)")}repairSessionIdColumnRename(){this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(19)||this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(19,new Date().toISOString())}addFailedAtEpochColumn(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(20))return;this.db.query("PRAGMA table_info(pending_messages)").all().some(n=>n.name==="failed_at_epoch")||(this.db.run("ALTER TABLE pending_messages ADD COLUMN failed_at_epoch INTEGER"),_.debug("DB","Added failed_at_epoch column to pending_messages table")),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(20,new Date().toISOString())}addOnUpdateCascadeToForeignKeys(){if(!this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(21)){_.debug("DB","Adding ON UPDATE CASCADE to FK constraints on observations and session_summaries"),this.db.run("PRAGMA foreign_keys = OFF"),this.db.run("BEGIN TRANSACTION");try{this.db.run("DROP TRIGGER IF EXISTS observations_ai"),this.db.run("DROP TRIGGER IF EXISTS observations_ad"),this.db.run("DROP TRIGGER IF EXISTS observations_au"),this.db.run("DROP TABLE IF EXISTS observations_new"),this.db.run(`
        CREATE TABLE observations_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          memory_session_id TEXT NOT NULL,
          project TEXT NOT NULL,
          text TEXT,
          type TEXT NOT NULL,
          title TEXT,
          subtitle TEXT,
          facts TEXT,
          narrative TEXT,
          concepts TEXT,
          files_read TEXT,
          files_modified TEXT,
          prompt_number INTEGER,
          discovery_tokens INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `),this.db.run(`
        INSERT INTO observations_new
        SELECT id, memory_session_id, project, text, type, title, subtitle, facts,
               narrative, concepts, files_read, files_modified, prompt_number,
               discovery_tokens, created_at, created_at_epoch
        FROM observations
      `),this.db.run("DROP TABLE observations"),this.db.run("ALTER TABLE observations_new RENAME TO observations"),this.db.run(`
        CREATE INDEX idx_observations_sdk_session ON observations(memory_session_id);
        CREATE INDEX idx_observations_project ON observations(project);
        CREATE INDEX idx_observations_type ON observations(type);
        CREATE INDEX idx_observations_created ON observations(created_at_epoch DESC);
      `),this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='observations_fts'").all().length>0&&this.db.run(`
          CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN
            INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)
            VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);
          END;

          CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN
            INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)
            VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);
          END;

          CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN
            INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)
            VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);
            INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)
            VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);
          END;
        `),this.db.run("DROP TABLE IF EXISTS session_summaries_new"),this.db.run(`
        CREATE TABLE session_summaries_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          memory_session_id TEXT NOT NULL,
          project TEXT NOT NULL,
          request TEXT,
          investigated TEXT,
          learned TEXT,
          completed TEXT,
          next_steps TEXT,
          files_read TEXT,
          files_edited TEXT,
          notes TEXT,
          prompt_number INTEGER,
          discovery_tokens INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          created_at_epoch INTEGER NOT NULL,
          FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `),this.db.run(`
        INSERT INTO session_summaries_new
        SELECT id, memory_session_id, project, request, investigated, learned,
               completed, next_steps, files_read, files_edited, notes,
               prompt_number, discovery_tokens, created_at, created_at_epoch
        FROM session_summaries
      `),this.db.run("DROP TRIGGER IF EXISTS session_summaries_ai"),this.db.run("DROP TRIGGER IF EXISTS session_summaries_ad"),this.db.run("DROP TRIGGER IF EXISTS session_summaries_au"),this.db.run("DROP TABLE session_summaries"),this.db.run("ALTER TABLE session_summaries_new RENAME TO session_summaries"),this.db.run(`
        CREATE INDEX idx_session_summaries_sdk_session ON session_summaries(memory_session_id);
        CREATE INDEX idx_session_summaries_project ON session_summaries(project);
        CREATE INDEX idx_session_summaries_created ON session_summaries(created_at_epoch DESC);
      `),this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='session_summaries_fts'").all().length>0&&this.db.run(`
          CREATE TRIGGER IF NOT EXISTS session_summaries_ai AFTER INSERT ON session_summaries BEGIN
            INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)
            VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);
          END;

          CREATE TRIGGER IF NOT EXISTS session_summaries_ad AFTER DELETE ON session_summaries BEGIN
            INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)
            VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);
          END;

          CREATE TRIGGER IF NOT EXISTS session_summaries_au AFTER UPDATE ON session_summaries BEGIN
            INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)
            VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);
            INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)
            VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);
          END;
        `),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(21,new Date().toISOString()),this.db.run("COMMIT"),this.db.run("PRAGMA foreign_keys = ON"),_.debug("DB","Successfully added ON UPDATE CASCADE to FK constraints")}catch(s){throw this.db.run("ROLLBACK"),this.db.run("PRAGMA foreign_keys = ON"),s}}}addObservationContentHashColumn(){if(this.db.query("PRAGMA table_info(observations)").all().some(t=>t.name==="content_hash")){this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(22,new Date().toISOString());return}this.db.run("ALTER TABLE observations ADD COLUMN content_hash TEXT"),this.db.run("UPDATE observations SET content_hash = substr(hex(randomblob(8)), 1, 16) WHERE content_hash IS NULL"),this.db.run("CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash, created_at_epoch)"),_.debug("DB","Added content_hash column to observations table with backfill and index"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(22,new Date().toISOString())}addSessionCustomTitleColumn(){if(this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(23))return;this.db.query("PRAGMA table_info(sdk_sessions)").all().some(n=>n.name==="custom_title")||(this.db.run("ALTER TABLE sdk_sessions ADD COLUMN custom_title TEXT"),_.debug("DB","Added custom_title column to sdk_sessions table")),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(23,new Date().toISOString())}addSessionPlatformSourceColumn(){let s=this.db.query("PRAGMA table_info(sdk_sessions)").all().some(i=>i.name==="platform_source"),n=this.db.query("PRAGMA index_list(sdk_sessions)").all().some(i=>i.name==="idx_sdk_sessions_platform_source");this.db.prepare("SELECT version FROM schema_versions WHERE version = ?").get(24)&&s&&n||(s||(this.db.run(`ALTER TABLE sdk_sessions ADD COLUMN platform_source TEXT NOT NULL DEFAULT '${h}'`),_.debug("DB","Added platform_source column to sdk_sessions table")),this.db.run(`
      UPDATE sdk_sessions
      SET platform_source = '${h}'
      WHERE platform_source IS NULL OR platform_source = ''
    `),n||this.db.run("CREATE INDEX IF NOT EXISTS idx_sdk_sessions_platform_source ON sdk_sessions(platform_source)"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(24,new Date().toISOString()))}addObservationModelColumns(){let e=this.db.query("PRAGMA table_info(observations)").all(),s=e.some(n=>n.name==="generated_by_model"),t=e.some(n=>n.name==="relevance_count");s&&t||(s||this.db.run("ALTER TABLE observations ADD COLUMN generated_by_model TEXT"),t||this.db.run("ALTER TABLE observations ADD COLUMN relevance_count INTEGER DEFAULT 0"),this.db.prepare("INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)").run(26,new Date().toISOString()))}updateMemorySessionId(e,s){this.db.prepare(`
      UPDATE sdk_sessions
      SET memory_session_id = ?
      WHERE id = ?
    `).run(s,e)}markSessionCompleted(e){let s=Date.now(),t=new Date(s).toISOString();this.db.prepare(`
      UPDATE sdk_sessions
      SET status = 'completed', completed_at = ?, completed_at_epoch = ?
      WHERE id = ?
    `).run(t,s,e)}markSessionFailed(e){let s=Date.now(),t=new Date(s).toISOString();this.db.prepare(`
      UPDATE sdk_sessions
      SET status = 'failed', completed_at = ?, completed_at_epoch = ?
      WHERE id = ?
    `).run(t,s,e)}ensureMemorySessionIdRegistered(e,s){let t=this.db.prepare(`
      SELECT id, memory_session_id FROM sdk_sessions WHERE id = ?
    `).get(e);if(!t)throw new Error(`Session ${e} not found in sdk_sessions`);t.memory_session_id!==s&&(this.db.prepare(`
        UPDATE sdk_sessions SET memory_session_id = ? WHERE id = ?
      `).run(s,e),_.info("DB","Registered memory_session_id before storage (FK fix)",{sessionDbId:e,oldId:t.memory_session_id,newId:s}))}getRecentSummaries(e,s=10){return this.db.prepare(`
      SELECT
        request, investigated, learned, completed, next_steps,
        files_read, files_edited, notes, prompt_number, created_at
      FROM session_summaries
      WHERE project = ?
      ORDER BY created_at_epoch DESC
      LIMIT ?
    `).all(e,s)}getRecentSummariesWithSessionInfo(e,s=3){return this.db.prepare(`
      SELECT
        memory_session_id, request, learned, completed, next_steps,
        prompt_number, created_at
      FROM session_summaries
      WHERE project = ?
      ORDER BY created_at_epoch DESC
      LIMIT ?
    `).all(e,s)}getRecentObservations(e,s=20){return this.db.prepare(`
      SELECT type, text, prompt_number, created_at
      FROM observations
      WHERE project = ?
      ORDER BY created_at_epoch DESC
      LIMIT ?
    `).all(e,s)}getAllRecentObservations(e=100){return this.db.prepare(`
      SELECT
        o.id,
        o.type,
        o.title,
        o.subtitle,
        o.text,
        o.project,
        COALESCE(s.platform_source, '${h}') as platform_source,
        o.prompt_number,
        o.created_at,
        o.created_at_epoch
      FROM observations o
      LEFT JOIN sdk_sessions s ON o.memory_session_id = s.memory_session_id
      ORDER BY o.created_at_epoch DESC
      LIMIT ?
    `).all(e)}getAllRecentSummaries(e=50){return this.db.prepare(`
      SELECT
        ss.id,
        ss.request,
        ss.investigated,
        ss.learned,
        ss.completed,
        ss.next_steps,
        ss.files_read,
        ss.files_edited,
        ss.notes,
        ss.project,
        COALESCE(s.platform_source, '${h}') as platform_source,
        ss.prompt_number,
        ss.created_at,
        ss.created_at_epoch
      FROM session_summaries ss
      LEFT JOIN sdk_sessions s ON ss.memory_session_id = s.memory_session_id
      ORDER BY ss.created_at_epoch DESC
      LIMIT ?
    `).all(e)}getAllRecentUserPrompts(e=100){return this.db.prepare(`
      SELECT
        up.id,
        up.content_session_id,
        s.project,
        COALESCE(s.platform_source, '${h}') as platform_source,
        up.prompt_number,
        up.prompt_text,
        up.created_at,
        up.created_at_epoch
      FROM user_prompts up
      LEFT JOIN sdk_sessions s ON up.content_session_id = s.content_session_id
      ORDER BY up.created_at_epoch DESC
      LIMIT ?
    `).all(e)}getAllProjects(e){let s=e?y(e):void 0,t=`
      SELECT DISTINCT project
      FROM sdk_sessions
      WHERE project IS NOT NULL AND project != ''
    `,n=[];return s&&(t+=" AND COALESCE(platform_source, ?) = ?",n.push(h,s)),t+=" ORDER BY project ASC",this.db.prepare(t).all(...n).map(i=>i.project)}getProjectCatalog(){let e=this.db.prepare(`
      SELECT
        COALESCE(platform_source, '${h}') as platform_source,
        project,
        MAX(started_at_epoch) as latest_epoch
      FROM sdk_sessions
      WHERE project IS NOT NULL AND project != ''
      GROUP BY COALESCE(platform_source, '${h}'), project
      ORDER BY latest_epoch DESC
    `).all(),s=[],t=new Set,n={};for(let i of e){let a=y(i.platform_source);n[a]||(n[a]=[]),n[a].includes(i.project)||n[a].push(i.project),t.has(i.project)||(t.add(i.project),s.push(i.project))}let o=Re(Object.keys(n));return{projects:s,sources:o,projectsBySource:Object.fromEntries(o.map(i=>[i,n[i]||[]]))}}getLatestUserPrompt(e){return this.db.prepare(`
      SELECT
        up.*,
        s.memory_session_id,
        s.project,
        COALESCE(s.platform_source, '${h}') as platform_source
      FROM user_prompts up
      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id
      WHERE up.content_session_id = ?
      ORDER BY up.created_at_epoch DESC
      LIMIT 1
    `).get(e)}getRecentSessionsWithStatus(e,s=3){return this.db.prepare(`
      SELECT * FROM (
        SELECT
          s.memory_session_id,
          s.status,
          s.started_at,
          s.started_at_epoch,
          s.user_prompt,
          CASE WHEN sum.memory_session_id IS NOT NULL THEN 1 ELSE 0 END as has_summary
        FROM sdk_sessions s
        LEFT JOIN session_summaries sum ON s.memory_session_id = sum.memory_session_id
        WHERE s.project = ? AND s.memory_session_id IS NOT NULL
        GROUP BY s.memory_session_id
        ORDER BY s.started_at_epoch DESC
        LIMIT ?
      )
      ORDER BY started_at_epoch ASC
    `).all(e,s)}getObservationsForSession(e){return this.db.prepare(`
      SELECT title, subtitle, type, prompt_number
      FROM observations
      WHERE memory_session_id = ?
      ORDER BY created_at_epoch ASC
    `).all(e)}getObservationById(e){return this.db.prepare(`
      SELECT *
      FROM observations
      WHERE id = ?
    `).get(e)||null}getObservationsByIds(e,s={}){if(e.length===0)return[];let{orderBy:t="date_desc",limit:n,project:o,type:i,concepts:a,files:d}=s,m=t==="date_asc"?"ASC":"DESC",c=n?`LIMIT ${n}`:"",l=e.map(()=>"?").join(","),E=[...e],T=[];if(o&&(T.push("project = ?"),E.push(o)),i)if(Array.isArray(i)){let p=i.map(()=>"?").join(",");T.push(`type IN (${p})`),E.push(...i)}else T.push("type = ?"),E.push(i);if(a){let p=Array.isArray(a)?a:[a],R=p.map(()=>"EXISTS (SELECT 1 FROM json_each(concepts) WHERE value = ?)");E.push(...p),T.push(`(${R.join(" OR ")})`)}if(d){let p=Array.isArray(d)?d:[d],R=p.map(()=>"(EXISTS (SELECT 1 FROM json_each(files_read) WHERE value LIKE ?) OR EXISTS (SELECT 1 FROM json_each(files_modified) WHERE value LIKE ?))");p.forEach(g=>{E.push(`%${g}%`,`%${g}%`)}),T.push(`(${R.join(" OR ")})`)}let O=T.length>0?`WHERE id IN (${l}) AND ${T.join(" AND ")}`:`WHERE id IN (${l})`;return this.db.prepare(`
      SELECT *
      FROM observations
      ${O}
      ORDER BY created_at_epoch ${m}
      ${c}
    `).all(...E)}getSummaryForSession(e){return this.db.prepare(`
      SELECT
        request, investigated, learned, completed, next_steps,
        files_read, files_edited, notes, prompt_number, created_at,
        created_at_epoch
      FROM session_summaries
      WHERE memory_session_id = ?
      ORDER BY created_at_epoch DESC
      LIMIT 1
    `).get(e)||null}getFilesForSession(e){let t=this.db.prepare(`
      SELECT files_read, files_modified
      FROM observations
      WHERE memory_session_id = ?
    `).all(e),n=new Set,o=new Set;for(let i of t)te(i.files_read).forEach(a=>n.add(a)),te(i.files_modified).forEach(a=>o.add(a));return{filesRead:Array.from(n),filesModified:Array.from(o)}}getSessionById(e){return this.db.prepare(`
      SELECT id, content_session_id, memory_session_id, project,
             COALESCE(platform_source, '${h}') as platform_source,
             user_prompt, custom_title
      FROM sdk_sessions
      WHERE id = ?
      LIMIT 1
    `).get(e)||null}getSessionByContentSessionId(e){return this.db.prepare(`
      SELECT id, content_session_id, memory_session_id, project, status, started_at_epoch
      FROM sdk_sessions
      WHERE content_session_id = ?
      LIMIT 1
    `).get(e)||null}countObservationsByMemorySessionId(e){return this.db.prepare(`
      SELECT COUNT(*) as count
      FROM observations
      WHERE memory_session_id = ?
    `).get(e)?.count??0}countSummariesByMemorySessionId(e){return this.db.prepare(`
      SELECT COUNT(*) as count
      FROM session_summaries
      WHERE memory_session_id = ?
    `).get(e)?.count??0}hasSummaryForPrompt(e,s){return!!this.db.prepare(`
      SELECT 1
      FROM session_summaries
      WHERE memory_session_id = ? AND prompt_number = ?
      LIMIT 1
    `).get(e,s)}getSdkSessionsBySessionIds(e){if(e.length===0)return[];let s=e.map(()=>"?").join(",");return this.db.prepare(`
      SELECT id, content_session_id, memory_session_id, project,
             COALESCE(platform_source, '${h}') as platform_source,
             user_prompt, custom_title,
             started_at, started_at_epoch, completed_at, completed_at_epoch, status
      FROM sdk_sessions
      WHERE memory_session_id IN (${s})
      ORDER BY started_at_epoch DESC
    `).all(...e)}getPromptNumberFromUserPrompts(e){return this.db.prepare(`
      SELECT COUNT(*) as count FROM user_prompts WHERE content_session_id = ?
    `).get(e).count}createSDKSession(e,s,t,n,o){let i=new Date,a=i.getTime(),d=jt(n,o),m=d.platformSource??h,c=this.db.prepare(`
      SELECT id, platform_source FROM sdk_sessions WHERE content_session_id = ?
    `).get(e);if(c){if(s&&this.db.prepare(`
          UPDATE sdk_sessions SET project = ?
          WHERE content_session_id = ? AND (project IS NULL OR project = '')
        `).run(s,e),d.customTitle&&this.db.prepare(`
          UPDATE sdk_sessions SET custom_title = ?
          WHERE content_session_id = ? AND custom_title IS NULL
        `).run(d.customTitle,e),d.platformSource){let E=c.platform_source?.trim()?y(c.platform_source):void 0;if(!E)this.db.prepare(`
            UPDATE sdk_sessions SET platform_source = ?
            WHERE content_session_id = ?
              AND COALESCE(platform_source, '') = ''
          `).run(d.platformSource,e);else if(E!==d.platformSource)throw new Error(`Platform source conflict for session ${e}: existing=${E}, received=${d.platformSource}`)}return c.id}return this.db.prepare(`
      INSERT INTO sdk_sessions
      (content_session_id, memory_session_id, project, platform_source, user_prompt, custom_title, started_at, started_at_epoch, status)
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 'active')
    `).run(e,s,m,t,d.customTitle||null,i.toISOString(),a),this.db.prepare("SELECT id FROM sdk_sessions WHERE content_session_id = ?").get(e).id}saveUserPrompt(e,s,t){let n=new Date,o=n.getTime();return this.db.prepare(`
      INSERT INTO user_prompts
      (content_session_id, prompt_number, prompt_text, created_at, created_at_epoch)
      VALUES (?, ?, ?, ?, ?)
    `).run(e,s,t,n.toISOString(),o).lastInsertRowid}getUserPrompt(e,s){return this.db.prepare(`
      SELECT prompt_text
      FROM user_prompts
      WHERE content_session_id = ? AND prompt_number = ?
      LIMIT 1
    `).get(e,s)?.prompt_text??null}storeObservation(e,s,t,n,o=0,i,a){let d=i??Date.now(),m=new Date(d).toISOString(),c=H(e,t.title,t.narrative),l=j(this.db,c,d);if(l)return{id:l.id,createdAtEpoch:l.created_at_epoch};let T=this.db.prepare(`
      INSERT INTO observations
      (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,
       files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch,
       generated_by_model)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(e,s,t.type,t.title,t.subtitle,JSON.stringify(t.facts),t.narrative,JSON.stringify(t.concepts),JSON.stringify(t.files_read),JSON.stringify(t.files_modified),n||null,o,c,m,d,a||null);return{id:Number(T.lastInsertRowid),createdAtEpoch:d}}storeSummary(e,s,t,n,o=0,i){let a=i??Date.now(),d=new Date(a).toISOString(),c=this.db.prepare(`
      INSERT INTO session_summaries
      (memory_session_id, project, request, investigated, learned, completed,
       next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(e,s,t.request,t.investigated,t.learned,t.completed,t.next_steps,t.notes,n||null,o,d,a);return{id:Number(c.lastInsertRowid),createdAtEpoch:a}}storeObservations(e,s,t,n,o,i=0,a,d){let m=a??Date.now(),c=new Date(m).toISOString();return this.db.transaction(()=>{let E=[],T=this.db.prepare(`
        INSERT INTO observations
        (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,
         files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch,
         generated_by_model)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);for(let S of t){let p=H(e,S.title,S.narrative),R=j(this.db,p,m);if(R){E.push(R.id);continue}let g=T.run(e,s,S.type,S.title,S.subtitle,JSON.stringify(S.facts),S.narrative,JSON.stringify(S.concepts),JSON.stringify(S.files_read),JSON.stringify(S.files_modified),o||null,i,p,c,m,d||null);E.push(Number(g.lastInsertRowid))}let O=null;if(n){let p=this.db.prepare(`
          INSERT INTO session_summaries
          (memory_session_id, project, request, investigated, learned, completed,
           next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(e,s,n.request,n.investigated,n.learned,n.completed,n.next_steps,n.notes,o||null,i,c,m);O=Number(p.lastInsertRowid)}return{observationIds:E,summaryId:O,createdAtEpoch:m}})()}storeObservationsAndMarkComplete(e,s,t,n,o,i,a,d=0,m,c){let l=m??Date.now(),E=new Date(l).toISOString();return this.db.transaction(()=>{let O=[],S=this.db.prepare(`
        INSERT INTO observations
        (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,
         files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch,
         generated_by_model)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);for(let g of t){let b=H(e,g.title,g.narrative),Ee=j(this.db,b,l);if(Ee){O.push(Ee.id);continue}let Ct=S.run(e,s,g.type,g.title,g.subtitle,JSON.stringify(g.facts),g.narrative,JSON.stringify(g.concepts),JSON.stringify(g.files_read),JSON.stringify(g.files_modified),a||null,d,b,E,l,c||null);O.push(Number(Ct.lastInsertRowid))}let p;if(n){let b=this.db.prepare(`
          INSERT INTO session_summaries
          (memory_session_id, project, request, investigated, learned, completed,
           next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(e,s,n.request,n.investigated,n.learned,n.completed,n.next_steps,n.notes,a||null,d,E,l);p=Number(b.lastInsertRowid)}return this.db.prepare(`
        UPDATE pending_messages
        SET
          status = 'processed',
          completed_at_epoch = ?,
          tool_input = NULL,
          tool_response = NULL
        WHERE id = ? AND status = 'processing'
      `).run(l,o),{observationIds:O,summaryId:p,createdAtEpoch:l}})()}getSessionSummariesByIds(e,s={}){if(e.length===0)return[];let{orderBy:t="date_desc",limit:n,project:o}=s,i=t==="date_asc"?"ASC":"DESC",a=n?`LIMIT ${n}`:"",d=e.map(()=>"?").join(","),m=[...e],c=o?`WHERE id IN (${d}) AND project = ?`:`WHERE id IN (${d})`;return o&&m.push(o),this.db.prepare(`
      SELECT * FROM session_summaries
      ${c}
      ORDER BY created_at_epoch ${i}
      ${a}
    `).all(...m)}getUserPromptsByIds(e,s={}){if(e.length===0)return[];let{orderBy:t="date_desc",limit:n,project:o}=s,i=t==="date_asc"?"ASC":"DESC",a=n?`LIMIT ${n}`:"",d=e.map(()=>"?").join(","),m=[...e],c=o?"AND s.project = ?":"";return o&&m.push(o),this.db.prepare(`
      SELECT
        up.*,
        s.project,
        s.memory_session_id
      FROM user_prompts up
      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id
      WHERE up.id IN (${d}) ${c}
      ORDER BY up.created_at_epoch ${i}
      ${a}
    `).all(...m)}getTimelineAroundTimestamp(e,s=10,t=10,n){return this.getTimelineAroundObservation(null,e,s,t,n)}getTimelineAroundObservation(e,s,t=10,n=10,o){let i=o?"AND project = ?":"",a=o?[o]:[],d,m;if(e!==null){let p=`
        SELECT id, created_at_epoch
        FROM observations
        WHERE id <= ? ${i}
        ORDER BY id DESC
        LIMIT ?
      `,R=`
        SELECT id, created_at_epoch
        FROM observations
        WHERE id >= ? ${i}
        ORDER BY id ASC
        LIMIT ?
      `;try{let g=this.db.prepare(p).all(e,...a,t+1),b=this.db.prepare(R).all(e,...a,n+1);if(g.length===0&&b.length===0)return{observations:[],sessions:[],prompts:[]};d=g.length>0?g[g.length-1].created_at_epoch:s,m=b.length>0?b[b.length-1].created_at_epoch:s}catch(g){return _.error("DB","Error getting boundary observations",void 0,{error:g,project:o}),{observations:[],sessions:[],prompts:[]}}}else{let p=`
        SELECT created_at_epoch
        FROM observations
        WHERE created_at_epoch <= ? ${i}
        ORDER BY created_at_epoch DESC
        LIMIT ?
      `,R=`
        SELECT created_at_epoch
        FROM observations
        WHERE created_at_epoch >= ? ${i}
        ORDER BY created_at_epoch ASC
        LIMIT ?
      `;try{let g=this.db.prepare(p).all(s,...a,t),b=this.db.prepare(R).all(s,...a,n+1);if(g.length===0&&b.length===0)return{observations:[],sessions:[],prompts:[]};d=g.length>0?g[g.length-1].created_at_epoch:s,m=b.length>0?b[b.length-1].created_at_epoch:s}catch(g){return _.error("DB","Error getting boundary timestamps",void 0,{error:g,project:o}),{observations:[],sessions:[],prompts:[]}}}let c=`
      SELECT *
      FROM observations
      WHERE created_at_epoch >= ? AND created_at_epoch <= ? ${i}
      ORDER BY created_at_epoch ASC
    `,l=`
      SELECT *
      FROM session_summaries
      WHERE created_at_epoch >= ? AND created_at_epoch <= ? ${i}
      ORDER BY created_at_epoch ASC
    `,E=`
      SELECT up.*, s.project, s.memory_session_id
      FROM user_prompts up
      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id
      WHERE up.created_at_epoch >= ? AND up.created_at_epoch <= ? ${i.replace("project","s.project")}
      ORDER BY up.created_at_epoch ASC
    `,T=this.db.prepare(c).all(d,m,...a),O=this.db.prepare(l).all(d,m,...a),S=this.db.prepare(E).all(d,m,...a);return{observations:T,sessions:O.map(p=>({id:p.id,memory_session_id:p.memory_session_id,project:p.project,request:p.request,completed:p.completed,next_steps:p.next_steps,created_at:p.created_at,created_at_epoch:p.created_at_epoch})),prompts:S.map(p=>({id:p.id,content_session_id:p.content_session_id,prompt_number:p.prompt_number,prompt_text:p.prompt_text,project:p.project,created_at:p.created_at,created_at_epoch:p.created_at_epoch}))}}getPromptById(e){return this.db.prepare(`
      SELECT
        p.id,
        p.content_session_id,
        p.prompt_number,
        p.prompt_text,
        s.project,
        p.created_at,
        p.created_at_epoch
      FROM user_prompts p
      LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id
      WHERE p.id = ?
      LIMIT 1
    `).get(e)||null}getPromptsByIds(e){if(e.length===0)return[];let s=e.map(()=>"?").join(",");return this.db.prepare(`
      SELECT
        p.id,
        p.content_session_id,
        p.prompt_number,
        p.prompt_text,
        s.project,
        p.created_at,
        p.created_at_epoch
      FROM user_prompts p
      LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id
      WHERE p.id IN (${s})
      ORDER BY p.created_at_epoch DESC
    `).all(...e)}getSessionSummaryById(e){return this.db.prepare(`
      SELECT
        id,
        memory_session_id,
        content_session_id,
        project,
        user_prompt,
        request_summary,
        learned_summary,
        status,
        created_at,
        created_at_epoch
      FROM sdk_sessions
      WHERE id = ?
      LIMIT 1
    `).get(e)||null}getOrCreateManualSession(e){let s=`manual-${e}`,t=`manual-content-${e}`;if(this.db.prepare("SELECT memory_session_id FROM sdk_sessions WHERE memory_session_id = ?").get(s))return s;let o=new Date;return this.db.prepare(`
      INSERT INTO sdk_sessions (memory_session_id, content_session_id, project, platform_source, started_at, started_at_epoch, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).run(s,t,e,h,o.toISOString(),o.getTime()),_.info("SESSION","Created manual session",{memorySessionId:s,project:e}),s}close(){this.db.close()}importSdkSession(e,s={}){let t=this.getPreservedImportId(e.id,s.preserveId,"sdk_sessions"),n=this.db.prepare("SELECT id FROM sdk_sessions WHERE content_session_id = ?").get(e.content_session_id);if(n){if(t!==null&&n.id!==t)throw new Error(`Cannot preserve sdk_sessions id ${t}: duplicate content_session_id already exists as id ${n.id}`);return{imported:!1,id:n.id}}this.assertPreservedImportIdAvailable("sdk_sessions",t);let o=t===null?this.db.prepare(`
      INSERT INTO sdk_sessions (
        content_session_id, memory_session_id, project, platform_source, user_prompt,
        started_at, started_at_epoch, completed_at, completed_at_epoch, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `):this.db.prepare(`
      INSERT INTO sdk_sessions (
        id, content_session_id, memory_session_id, project, platform_source, user_prompt,
        started_at, started_at_epoch, completed_at, completed_at_epoch, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),i=[e.content_session_id,e.memory_session_id,e.project,y(e.platform_source),e.user_prompt,e.started_at,e.started_at_epoch,e.completed_at,e.completed_at_epoch,e.status];return{imported:!0,id:o.run(...t===null?i:[t,...i]).lastInsertRowid}}importSessionSummary(e,s={}){let t=this.getPreservedImportId(e.id,s.preserveId,"session_summaries"),n=this.db.prepare("SELECT id FROM session_summaries WHERE memory_session_id = ?").get(e.memory_session_id);if(n){if(t!==null&&n.id!==t)throw new Error(`Cannot preserve session_summaries id ${t}: duplicate memory_session_id already exists as id ${n.id}`);return{imported:!1,id:n.id}}this.assertPreservedImportIdAvailable("session_summaries",t);let o=t===null?this.db.prepare(`
      INSERT INTO session_summaries (
        memory_session_id, project, request, investigated, learned,
        completed, next_steps, files_read, files_edited, notes,
        prompt_number, discovery_tokens, created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `):this.db.prepare(`
      INSERT INTO session_summaries (
        id, memory_session_id, project, request, investigated, learned,
        completed, next_steps, files_read, files_edited, notes,
        prompt_number, discovery_tokens, created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),i=[e.memory_session_id,e.project,e.request,e.investigated,e.learned,e.completed,e.next_steps,e.files_read,e.files_edited,e.notes,e.prompt_number,e.discovery_tokens||0,e.created_at,e.created_at_epoch];return{imported:!0,id:o.run(...t===null?i:[t,...i]).lastInsertRowid}}importObservation(e,s={}){let t=this.getPreservedImportId(e.id,s.preserveId,"observations"),n=this.db.prepare(`
      SELECT id FROM observations
      WHERE memory_session_id = ? AND title = ? AND created_at_epoch = ?
    `).get(e.memory_session_id,e.title,e.created_at_epoch);if(n){if(t!==null&&n.id!==t)throw new Error(`Cannot preserve observations id ${t}: duplicate observation already exists as id ${n.id}`);return{imported:!1,id:n.id}}this.assertPreservedImportIdAvailable("observations",t);let o=t===null?this.db.prepare(`
      INSERT INTO observations (
        memory_session_id, project, text, type, title, subtitle,
        facts, narrative, concepts, files_read, files_modified,
        prompt_number, discovery_tokens, created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `):this.db.prepare(`
      INSERT INTO observations (
        id, memory_session_id, project, text, type, title, subtitle,
        facts, narrative, concepts, files_read, files_modified,
        prompt_number, discovery_tokens, created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),i=[e.memory_session_id,e.project,e.text,e.type,e.title,e.subtitle,e.facts,e.narrative,e.concepts,e.files_read,e.files_modified,e.prompt_number,e.discovery_tokens||0,e.created_at,e.created_at_epoch];return{imported:!0,id:o.run(...t===null?i:[t,...i]).lastInsertRowid}}rebuildObservationsFTSIndex(){this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='observations_fts'").all().length>0&&this.db.run("INSERT INTO observations_fts(observations_fts) VALUES('rebuild')")}importUserPrompt(e,s={}){let t=this.getPreservedImportId(e.id,s.preserveId,"user_prompts"),n=this.db.prepare(`
      SELECT id FROM user_prompts
      WHERE content_session_id = ? AND prompt_number = ?
    `).get(e.content_session_id,e.prompt_number);if(n){if(t!==null&&n.id!==t)throw new Error(`Cannot preserve user_prompts id ${t}: duplicate prompt already exists as id ${n.id}`);return{imported:!1,id:n.id}}this.assertPreservedImportIdAvailable("user_prompts",t);let o=t===null?this.db.prepare(`
      INSERT INTO user_prompts (
        content_session_id, prompt_number, prompt_text,
        created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?)
    `):this.db.prepare(`
      INSERT INTO user_prompts (
        id, content_session_id, prompt_number, prompt_text,
        created_at, created_at_epoch
      ) VALUES (?, ?, ?, ?, ?, ?)
    `),i=[e.content_session_id,e.prompt_number,e.prompt_text,e.created_at,e.created_at_epoch];return{imported:!0,id:o.run(...t===null?i:[t,...i]).lastInsertRowid}}getPreservedImportId(e,s,t){if(!s)return null;if(!Number.isInteger(e)||e<=0)throw new Error(`Cannot preserve ${t} id: export row is missing a positive integer id`);return e}assertPreservedImportIdAvailable(e,s){if(s===null)return;if(this.db.prepare(`SELECT id FROM ${e} WHERE id = ?`).get(s))throw new Error(`Cannot preserve ${e} id ${s}: id already exists`)}};var Ce=require("os"),Le=L(require("path"),1);var B=require("fs"),G=L(require("path"),1),M={isWorktree:!1,worktreeName:null,parentRepoPath:null,parentProjectName:null};function Ne(r){let e=G.default.join(r,".git"),s;try{s=(0,B.statSync)(e)}catch{return M}if(!s.isFile())return M;let t;try{t=(0,B.readFileSync)(e,"utf-8").trim()}catch{return M}let n=t.match(/^gitdir:\s*(.+)$/);if(!n)return M;let i=n[1].match(/^(.+)[/\\]\.git[/\\]worktrees[/\\]([^/\\]+)$/);if(!i)return M;let a=i[1],d=G.default.basename(r),m=G.default.basename(a);return{isWorktree:!0,worktreeName:d,parentRepoPath:a,parentProjectName:m}}function ve(r){return r==="~"||r.startsWith("~/")?r.replace(/^~/,(0,Ce.homedir)()):r}function Xt(r){if(!r||r.trim()==="")return _.warn("PROJECT_NAME","Empty cwd provided, using fallback",{cwd:r}),"unknown-project";let e=ve(r),s=Le.default.basename(e);if(s===""){if(process.platform==="win32"){let n=r.match(/^([A-Z]):\\/i);if(n){let i=`drive-${n[1].toUpperCase()}`;return _.info("PROJECT_NAME","Drive root detected",{cwd:r,projectName:i}),i}}return _.warn("PROJECT_NAME","Root directory detected, using fallback",{cwd:r}),"unknown-project"}return s}function ye(r){let e=Xt(r);if(!r)return{primary:e,parent:null,isWorktree:!1,allProjects:[e]};let s=ve(r),t=Ne(s);if(t.isWorktree&&t.parentProjectName){let n=Array.from(new Set([t.parentProjectName,e]));return{primary:t.parentProjectName,parent:t.parentProjectName,isWorktree:!0,allProjects:n}}return{primary:e,parent:null,isWorktree:!1,allProjects:[e]}}var De=L(require("path"),1),Me=require("os");var N=require("fs"),U=require("path"),se=require("os"),W=class{static DEFAULTS={CLAUDE_MEM_MODEL:"claude-sonnet-4-6",CLAUDE_MEM_CONTEXT_OBSERVATIONS:"50",CLAUDE_MEM_WORKER_PORT:"37777",CLAUDE_MEM_WORKER_HOST:"127.0.0.1",CLAUDE_MEM_SKIP_TOOLS:"ListMcpResourcesTool,SlashCommand,Skill,TodoWrite,AskUserQuestion",CLAUDE_MEM_PROVIDER:"claude",CLAUDE_MEM_CLAUDE_AUTH_METHOD:"cli",CLAUDE_MEM_GEMINI_API_KEY:"",CLAUDE_MEM_GEMINI_MODEL:"gemini-2.5-flash-lite",CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED:"true",CLAUDE_MEM_GEMINI_MAX_CONTEXT_MESSAGES:"20",CLAUDE_MEM_GEMINI_MAX_TOKENS:"100000",CLAUDE_MEM_OPENROUTER_API_KEY:"",CLAUDE_MEM_OPENROUTER_BASE_URL:"https://openrouter.ai/api/v1/chat/completions",CLAUDE_MEM_OPENROUTER_MODEL:"xiaomi/mimo-v2-flash:free",CLAUDE_MEM_OPENROUTER_SITE_URL:"",CLAUDE_MEM_OPENROUTER_APP_NAME:"claude-mem",CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES:"20",CLAUDE_MEM_OPENROUTER_MAX_TOKENS:"100000",CLAUDE_MEM_DATA_DIR:(0,U.join)((0,se.homedir)(),".claude-mem"),CLAUDE_MEM_LOG_LEVEL:"INFO",CLAUDE_MEM_PYTHON_VERSION:"3.13",CLAUDE_CODE_PATH:"",CLAUDE_MEM_MODE:"code",CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS:"false",CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS:"false",CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT:"false",CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT:"true",CLAUDE_MEM_CONTEXT_FULL_COUNT:"0",CLAUDE_MEM_CONTEXT_FULL_FIELD:"narrative",CLAUDE_MEM_CONTEXT_SESSION_COUNT:"10",CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY:"true",CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE:"false",CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT:"true",CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED:"false",CLAUDE_MEM_FOLDER_USE_LOCAL_MD:"false",CLAUDE_MEM_TRANSCRIPTS_ENABLED:"true",CLAUDE_MEM_TRANSCRIPTS_CONFIG_PATH:(0,U.join)((0,se.homedir)(),".claude-mem","transcript-watch.json"),CLAUDE_MEM_MAX_CONCURRENT_AGENTS:"2",CLAUDE_MEM_EXCLUDED_PROJECTS:"",CLAUDE_MEM_FOLDER_MD_EXCLUDE:"[]",CLAUDE_MEM_SEMANTIC_INJECT:"false",CLAUDE_MEM_SEMANTIC_INJECT_LIMIT:"5",CLAUDE_MEM_TIER_ROUTING_ENABLED:"true",CLAUDE_MEM_TIER_SIMPLE_MODEL:"haiku",CLAUDE_MEM_TIER_SUMMARY_MODEL:"",CLAUDE_MEM_CHROMA_ENABLED:"true",CLAUDE_MEM_CHROMA_MODE:"local",CLAUDE_MEM_CHROMA_HOST:"127.0.0.1",CLAUDE_MEM_CHROMA_PORT:"8000",CLAUDE_MEM_CHROMA_SSL:"false",CLAUDE_MEM_CHROMA_API_KEY:"",CLAUDE_MEM_CHROMA_TENANT:"default_tenant",CLAUDE_MEM_CHROMA_DATABASE:"default_database"};static getAllDefaults(){return{...this.DEFAULTS}}static get(e){return process.env[e]??this.DEFAULTS[e]}static getInt(e){let s=this.get(e);return parseInt(s,10)}static getBool(e){let s=this.get(e);return s==="true"||s===!0}static applyEnvOverrides(e){let s={...e};for(let t of Object.keys(this.DEFAULTS))process.env[t]!==void 0&&(s[t]=process.env[t]);return s}static loadFromFile(e){try{if(!(0,N.existsSync)(e)){let i=this.getAllDefaults();try{let a=(0,U.dirname)(e);(0,N.existsSync)(a)||(0,N.mkdirSync)(a,{recursive:!0}),(0,N.writeFileSync)(e,JSON.stringify(i,null,2),"utf-8"),console.log("[SETTINGS] Created settings file with defaults:",e)}catch(a){console.warn("[SETTINGS] Failed to create settings file, using in-memory defaults:",e,a)}return this.applyEnvOverrides(i)}let s=(0,N.readFileSync)(e,"utf-8"),t=JSON.parse(s),n=t;if(t.env&&typeof t.env=="object"){n=t.env;try{(0,N.writeFileSync)(e,JSON.stringify(n,null,2),"utf-8"),console.log("[SETTINGS] Migrated settings file from nested to flat schema:",e)}catch(i){console.warn("[SETTINGS] Failed to auto-migrate settings file:",e,i)}}let o={...this.DEFAULTS};for(let i of Object.keys(this.DEFAULTS))n[i]!==void 0&&(o[i]=n[i]);return this.applyEnvOverrides(o)}catch(s){return console.warn("[SETTINGS] Failed to load settings, using defaults:",e,s),this.applyEnvOverrides(this.getAllDefaults())}}};var x=require("fs"),Y=require("path");var A=class r{static instance=null;activeMode=null;modesDir;constructor(){let e=Oe(),s=[(0,Y.join)(e,"modes"),(0,Y.join)(e,"..","plugin","modes")],t=s.find(n=>(0,x.existsSync)(n));this.modesDir=t||s[0]}static getInstance(){return r.instance||(r.instance=new r),r.instance}parseInheritance(e){let s=e.split("--");if(s.length===1)return{hasParent:!1,parentId:"",overrideId:""};if(s.length>2)throw new Error(`Invalid mode inheritance: ${e}. Only one level of inheritance supported (parent--override)`);return{hasParent:!0,parentId:s[0],overrideId:e}}isPlainObject(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}deepMerge(e,s){let t={...e};for(let n in s){let o=s[n],i=e[n];this.isPlainObject(o)&&this.isPlainObject(i)?t[n]=this.deepMerge(i,o):t[n]=o}return t}loadModeFile(e){let s=(0,Y.join)(this.modesDir,`${e}.json`);if(!(0,x.existsSync)(s))throw new Error(`Mode file not found: ${s}`);let t=(0,x.readFileSync)(s,"utf-8");return JSON.parse(t)}loadMode(e){let s=this.parseInheritance(e);if(!s.hasParent)try{let d=this.loadModeFile(e);return this.activeMode=d,_.debug("SYSTEM",`Loaded mode: ${d.name} (${e})`,void 0,{types:d.observation_types.map(m=>m.id),concepts:d.observation_concepts.map(m=>m.id)}),d}catch{if(_.warn("SYSTEM",`Mode file not found: ${e}, falling back to 'code'`),e==="code")throw new Error("Critical: code.json mode file missing");return this.loadMode("code")}let{parentId:t,overrideId:n}=s,o;try{o=this.loadMode(t)}catch{_.warn("SYSTEM",`Parent mode '${t}' not found for ${e}, falling back to 'code'`),o=this.loadMode("code")}let i;try{i=this.loadModeFile(n),_.debug("SYSTEM",`Loaded override file: ${n} for parent ${t}`)}catch{return _.warn("SYSTEM",`Override file '${n}' not found, using parent mode '${t}' only`),this.activeMode=o,o}if(!i)return _.warn("SYSTEM",`Invalid override file: ${n}, using parent mode '${t}' only`),this.activeMode=o,o;let a=this.deepMerge(o,i);return this.activeMode=a,_.debug("SYSTEM",`Loaded mode with inheritance: ${a.name} (${e} = ${t} + ${n})`,void 0,{parent:t,override:n,types:a.observation_types.map(d=>d.id),concepts:a.observation_concepts.map(d=>d.id)}),a}getActiveMode(){if(!this.activeMode)throw new Error("No mode loaded. Call loadMode() first.");return this.activeMode}getObservationTypes(){return this.getActiveMode().observation_types}getObservationConcepts(){return this.getActiveMode().observation_concepts}getTypeIcon(e){return this.getObservationTypes().find(t=>t.id===e)?.emoji||"\u{1F4DD}"}getWorkEmoji(e){return this.getObservationTypes().find(t=>t.id===e)?.work_emoji||"\u{1F4DD}"}validateType(e){return this.getObservationTypes().some(s=>s.id===e)}getTypeLabel(e){return this.getObservationTypes().find(t=>t.id===e)?.label||e}};function re(){let r=De.default.join((0,Me.homedir)(),".claude-mem","settings.json"),e=W.loadFromFile(r),s=A.getInstance().getActiveMode(),t=new Set(s.observation_types.map(o=>o.id)),n=new Set(s.observation_concepts.map(o=>o.id));return{totalObservationCount:parseInt(e.CLAUDE_MEM_CONTEXT_OBSERVATIONS,10),fullObservationCount:parseInt(e.CLAUDE_MEM_CONTEXT_FULL_COUNT,10),sessionCount:parseInt(e.CLAUDE_MEM_CONTEXT_SESSION_COUNT,10),showReadTokens:e.CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS==="true",showWorkTokens:e.CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS==="true",showSavingsAmount:e.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT==="true",showSavingsPercent:e.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT==="true",observationTypes:t,observationConcepts:n,fullObservationField:e.CLAUDE_MEM_CONTEXT_FULL_FIELD,showLastSummary:e.CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY==="true",showLastMessage:e.CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE==="true"}}var u={reset:"\x1B[0m",bright:"\x1B[1m",dim:"\x1B[2m",cyan:"\x1B[36m",green:"\x1B[32m",yellow:"\x1B[33m",blue:"\x1B[34m",magenta:"\x1B[35m",gray:"\x1B[90m",red:"\x1B[31m"},Ue=4,ne=1;function oe(r){let e=(r.title?.length||0)+(r.subtitle?.length||0)+(r.narrative?.length||0)+JSON.stringify(r.facts||[]).length;return Math.ceil(e/Ue)}function ie(r){let e=r.length,s=r.reduce((i,a)=>i+oe(a),0),t=r.reduce((i,a)=>i+(a.discovery_tokens||0),0),n=t-s,o=t>0?Math.round(n/t*100):0;return{totalObservations:e,totalReadTokens:s,totalDiscoveryTokens:t,savings:n,savingsPercent:o}}function Gt(r){return A.getInstance().getWorkEmoji(r)}function k(r,e){let s=oe(r),t=r.discovery_tokens||0,n=Gt(r.type),o=t>0?`${n} ${t.toLocaleString()}`:"-";return{readTokens:s,discoveryTokens:t,discoveryDisplay:o,workEmoji:n}}function q(r){return r.showReadTokens||r.showWorkTokens||r.showSavingsAmount||r.showSavingsPercent}var ke=L(require("path"),1),V=require("fs");var xe=/<system-reminder>[\s\S]*?<\/system-reminder>/g;function ae(r,e,s,t){let n=Array.from(s.observationTypes),o=n.map(()=>"?").join(","),i=Array.from(s.observationConcepts),a=i.map(()=>"?").join(",");return r.db.prepare(`
    SELECT
      o.id,
      o.memory_session_id,
      COALESCE(s.platform_source, 'claude') as platform_source,
      o.type,
      o.title,
      o.subtitle,
      o.narrative,
      o.facts,
      o.concepts,
      o.files_read,
      o.files_modified,
      o.discovery_tokens,
      o.created_at,
      o.created_at_epoch
    FROM observations o
    LEFT JOIN sdk_sessions s ON o.memory_session_id = s.memory_session_id
    WHERE o.project = ?
      AND type IN (${o})
      AND EXISTS (
        SELECT 1 FROM json_each(o.concepts)
        WHERE value IN (${a})
      )
      ${t?"AND COALESCE(s.platform_source, 'claude') = ?":""}
    ORDER BY o.created_at_epoch DESC
    LIMIT ?
  `).all(e,...n,...i,...t?[t]:[],s.totalObservationCount)}function de(r,e,s,t){return r.db.prepare(`
    SELECT
      ss.id,
      ss.memory_session_id,
      COALESCE(s.platform_source, 'claude') as platform_source,
      ss.request,
      ss.investigated,
      ss.learned,
      ss.completed,
      ss.next_steps,
      ss.created_at,
      ss.created_at_epoch
    FROM session_summaries ss
    LEFT JOIN sdk_sessions s ON ss.memory_session_id = s.memory_session_id
    WHERE ss.project = ?
      ${t?"AND COALESCE(s.platform_source, 'claude') = ?":""}
    ORDER BY ss.created_at_epoch DESC
    LIMIT ?
  `).all(e,...t?[t]:[],s.sessionCount+ne)}function $e(r,e,s,t){let n=Array.from(s.observationTypes),o=n.map(()=>"?").join(","),i=Array.from(s.observationConcepts),a=i.map(()=>"?").join(","),d=e.map(()=>"?").join(",");return r.db.prepare(`
    SELECT
      o.id,
      o.memory_session_id,
      COALESCE(s.platform_source, 'claude') as platform_source,
      o.type,
      o.title,
      o.subtitle,
      o.narrative,
      o.facts,
      o.concepts,
      o.files_read,
      o.files_modified,
      o.discovery_tokens,
      o.created_at,
      o.created_at_epoch,
      o.project
    FROM observations o
    LEFT JOIN sdk_sessions s ON o.memory_session_id = s.memory_session_id
    WHERE o.project IN (${d})
      AND type IN (${o})
      AND EXISTS (
        SELECT 1 FROM json_each(o.concepts)
        WHERE value IN (${a})
      )
      ${t?"AND COALESCE(s.platform_source, 'claude') = ?":""}
    ORDER BY o.created_at_epoch DESC
    LIMIT ?
  `).all(...e,...n,...i,...t?[t]:[],s.totalObservationCount)}function we(r,e,s,t){let n=e.map(()=>"?").join(",");return r.db.prepare(`
    SELECT
      ss.id,
      ss.memory_session_id,
      COALESCE(s.platform_source, 'claude') as platform_source,
      ss.request,
      ss.investigated,
      ss.learned,
      ss.completed,
      ss.next_steps,
      ss.created_at,
      ss.created_at_epoch,
      ss.project
    FROM session_summaries ss
    LEFT JOIN sdk_sessions s ON ss.memory_session_id = s.memory_session_id
    WHERE ss.project IN (${n})
      ${t?"AND COALESCE(s.platform_source, 'claude') = ?":""}
    ORDER BY ss.created_at_epoch DESC
    LIMIT ?
  `).all(...e,...t?[t]:[],s.sessionCount+ne)}function Bt(r){return r.replace(/\//g,"-")}function Wt(r){try{if(!(0,V.existsSync)(r))return{userMessage:"",assistantMessage:""};let e=(0,V.readFileSync)(r,"utf-8").trim();if(!e)return{userMessage:"",assistantMessage:""};let s=e.split(`
`).filter(n=>n.trim()),t="";for(let n=s.length-1;n>=0;n--)try{let o=s[n];if(!o.includes('"type":"assistant"'))continue;let i=JSON.parse(o);if(i.type==="assistant"&&i.message?.content&&Array.isArray(i.message.content)){let a="";for(let d of i.message.content)d.type==="text"&&(a+=d.text);if(a=a.replace(xe,"").trim(),a){t=a;break}}}catch(o){_.debug("PARSER","Skipping malformed transcript line",{lineIndex:n},o);continue}return{userMessage:"",assistantMessage:t}}catch(e){return _.failure("WORKER","Failed to extract prior messages from transcript",{transcriptPath:r},e),{userMessage:"",assistantMessage:""}}}function ue(r,e,s,t){if(!e.showLastMessage||r.length===0)return{userMessage:"",assistantMessage:""};let n=r.find(d=>d.memory_session_id!==s);if(!n)return{userMessage:"",assistantMessage:""};let o=n.memory_session_id,i=Bt(t),a=ke.default.join(v,"projects",i,`${o}.jsonl`);return Wt(a)}function Fe(r,e){let s=e[0]?.id;return r.map((t,n)=>{let o=n===0?null:e[n+1];return{...t,displayEpoch:o?o.created_at_epoch:t.created_at_epoch,displayTime:o?o.created_at:t.created_at,shouldShowLink:t.id!==s}})}function me(r,e){let s=[...r.map(t=>({type:"observation",data:t})),...e.map(t=>({type:"summary",data:t}))];return s.sort((t,n)=>{let o=t.type==="observation"?t.data.created_at_epoch:t.data.displayEpoch,i=n.type==="observation"?n.data.created_at_epoch:n.data.displayEpoch;return o-i}),s}function Pe(r,e){return new Set(r.slice(0,e).map(s=>s.id))}function He(){let r=new Date,e=r.toLocaleDateString("en-CA"),s=r.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}).toLowerCase().replace(" ",""),t=r.toLocaleTimeString("en-US",{timeZoneName:"short"}).split(" ").pop();return`${e} ${s} ${t}`}function je(r){return[`# [${r}] recent context, ${He()}`,""]}function Xe(){return[`Legend: \u{1F3AF}session ${A.getInstance().getActiveMode().observation_types.map(s=>`${s.emoji}${s.id}`).join(" ")}`,"Format: ID TIME TYPE TITLE","Fetch details: get_observations([IDs]) | Search: mem-search skill",""]}function Ge(){return[]}function Be(){return[]}function We(r,e){let s=[],t=[`${r.totalObservations} obs (${r.totalReadTokens.toLocaleString()}t read)`,`${r.totalDiscoveryTokens.toLocaleString()}t work`];return r.totalDiscoveryTokens>0&&(e.showSavingsAmount||e.showSavingsPercent)&&(e.showSavingsPercent?t.push(`${r.savingsPercent}% savings`):e.showSavingsAmount&&t.push(`${r.savings.toLocaleString()}t saved`)),s.push(`Stats: ${t.join(" | ")}`),s.push(""),s}function Ye(r){return[`### ${r}`]}function qe(r){return r.toLowerCase().replace(" am","a").replace(" pm","p")}function Ve(r,e,s){let t=r.title||"Untitled",n=A.getInstance().getTypeIcon(r.type),o=e?qe(e):'"';return`${r.id} ${o} ${n} ${t}`}function Ke(r,e,s,t){let n=[],o=r.title||"Untitled",i=A.getInstance().getTypeIcon(r.type),a=e?qe(e):'"',{readTokens:d,discoveryDisplay:m}=k(r,t);n.push(`**${r.id}** ${a} ${i} **${o}**`),s&&n.push(s);let c=[];return t.showReadTokens&&c.push(`~${d}t`),t.showWorkTokens&&c.push(m),c.length>0&&n.push(c.join(" ")),n.push(""),n}function Je(r,e){return[`S${r.id} ${r.request||"Session started"} (${e})`]}function $(r,e){return e?[`**${r}**: ${e}`,""]:[]}function ze(r){return r.assistantMessage?["","---","","**Previously**","",`A: ${r.assistantMessage}`,""]:[]}function Qe(r,e){return["",`Access ${Math.round(r/1e3)}k tokens of past work via get_observations([IDs]) or mem-search skill.`]}function Ze(r){return`# [${r}] recent context, ${He()}

No previous sessions found.`}function et(){let r=new Date,e=r.toLocaleDateString("en-CA"),s=r.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}).toLowerCase().replace(" ",""),t=r.toLocaleTimeString("en-US",{timeZoneName:"short"}).split(" ").pop();return`${e} ${s} ${t}`}function tt(r){return["",`${u.bright}${u.cyan}[${r}] recent context, ${et()}${u.reset}`,`${u.gray}${"\u2500".repeat(60)}${u.reset}`,""]}function st(){let e=A.getInstance().getActiveMode().observation_types.map(s=>`${s.emoji} ${s.id}`).join(" | ");return[`${u.dim}Legend: session-request | ${e}${u.reset}`,""]}function rt(){return[`${u.bright}Column Key${u.reset}`,`${u.dim}  Read: Tokens to read this observation (cost to learn it now)${u.reset}`,`${u.dim}  Work: Tokens spent on work that produced this record ( research, building, deciding)${u.reset}`,""]}function nt(){return[`${u.dim}Context Index: This semantic index (titles, types, files, tokens) is usually sufficient to understand past work.${u.reset}`,"",`${u.dim}When you need implementation details, rationale, or debugging context:${u.reset}`,`${u.dim}  - Fetch by ID: get_observations([IDs]) for observations visible in this index${u.reset}`,`${u.dim}  - Search history: Use the mem-search skill for past decisions, bugs, and deeper research${u.reset}`,`${u.dim}  - Trust this index over re-reading code for past decisions and learnings${u.reset}`,""]}function ot(r,e){let s=[];if(s.push(`${u.bright}${u.cyan}Context Economics${u.reset}`),s.push(`${u.dim}  Loading: ${r.totalObservations} observations (${r.totalReadTokens.toLocaleString()} tokens to read)${u.reset}`),s.push(`${u.dim}  Work investment: ${r.totalDiscoveryTokens.toLocaleString()} tokens spent on research, building, and decisions${u.reset}`),r.totalDiscoveryTokens>0&&(e.showSavingsAmount||e.showSavingsPercent)){let t="  Your savings: ";e.showSavingsAmount&&e.showSavingsPercent?t+=`${r.savings.toLocaleString()} tokens (${r.savingsPercent}% reduction from reuse)`:e.showSavingsAmount?t+=`${r.savings.toLocaleString()} tokens`:t+=`${r.savingsPercent}% reduction from reuse`,s.push(`${u.green}${t}${u.reset}`)}return s.push(""),s}function it(r){return[`${u.bright}${u.cyan}${r}${u.reset}`,""]}function at(r){return[`${u.dim}${r}${u.reset}`]}function dt(r,e,s,t){let n=r.title||"Untitled",o=A.getInstance().getTypeIcon(r.type),{readTokens:i,discoveryTokens:a,workEmoji:d}=k(r,t),m=s?`${u.dim}${e}${u.reset}`:" ".repeat(e.length),c=t.showReadTokens&&i>0?`${u.dim}(~${i}t)${u.reset}`:"",l=t.showWorkTokens&&a>0?`${u.dim}(${d} ${a.toLocaleString()}t)${u.reset}`:"";return`  ${u.dim}#${r.id}${u.reset}  ${m}  ${o}  ${n} ${c} ${l}`}function ut(r,e,s,t,n){let o=[],i=r.title||"Untitled",a=A.getInstance().getTypeIcon(r.type),{readTokens:d,discoveryTokens:m,workEmoji:c}=k(r,n),l=s?`${u.dim}${e}${u.reset}`:" ".repeat(e.length),E=n.showReadTokens&&d>0?`${u.dim}(~${d}t)${u.reset}`:"",T=n.showWorkTokens&&m>0?`${u.dim}(${c} ${m.toLocaleString()}t)${u.reset}`:"";return o.push(`  ${u.dim}#${r.id}${u.reset}  ${l}  ${a}  ${u.bright}${i}${u.reset}`),t&&o.push(`    ${u.dim}${t}${u.reset}`),(E||T)&&o.push(`    ${E} ${T}`),o.push(""),o}function mt(r,e){let s=`${r.request||"Session started"} (${e})`;return[`${u.yellow}#S${r.id}${u.reset} ${s}`,""]}function w(r,e,s){return e?[`${s}${r}:${u.reset} ${e}`,""]:[]}function ct(r){return r.assistantMessage?["","---","",`${u.bright}${u.magenta}Previously${u.reset}`,"",`${u.dim}A: ${r.assistantMessage}${u.reset}`,""]:[]}function _t(r,e){let s=Math.round(r/1e3);return["",`${u.dim}Access ${s}k tokens of past research & decisions for just ${e.toLocaleString()}t. Use the claude-mem skill to access memories by ID.${u.reset}`]}function pt(r){return`
${u.bright}${u.cyan}[${r}] recent context, ${et()}${u.reset}
${u.gray}${"\u2500".repeat(60)}${u.reset}

${u.dim}No previous sessions found for this project yet.${u.reset}
`}function lt(r,e,s,t){let n=[];return t?n.push(...tt(r)):n.push(...je(r)),t?n.push(...st()):n.push(...Xe()),t?n.push(...rt()):n.push(...Ge()),t?n.push(...nt()):n.push(...Be()),q(s)&&(t?n.push(...ot(e,s)):n.push(...We(e,s))),n}var ce=L(require("path"),1);function z(r){if(!r)return[];try{let e=JSON.parse(r);return Array.isArray(e)?e:[]}catch(e){return _.debug("PARSER","Failed to parse JSON array, using empty fallback",{preview:r?.substring(0,50)},e),[]}}function _e(r){return new Date(r).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0})}function pe(r){return new Date(r).toLocaleString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function gt(r){return new Date(r).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric"})}function Et(r,e){return ce.default.isAbsolute(r)?ce.default.relative(e,r):r}function Tt(r,e,s){let t=z(r);if(t.length>0)return Et(t[0],e);if(s){let n=z(s);if(n.length>0)return Et(n[0],e)}return"General"}function Yt(r){let e=new Map;for(let t of r){let n=t.type==="observation"?t.data.created_at:t.data.displayTime,o=gt(n);e.has(o)||e.set(o,[]),e.get(o).push(t)}let s=Array.from(e.entries()).sort((t,n)=>{let o=new Date(t[0]).getTime(),i=new Date(n[0]).getTime();return o-i});return new Map(s)}function ft(r,e){return e.fullObservationField==="narrative"?r.narrative:r.facts?z(r.facts).join(`
`):null}function qt(r,e,s,t){let n=[];n.push(...Ye(r));let o="";for(let i of e)if(i.type==="summary"){let a=i.data,d=_e(a.displayTime);n.push(...Je(a,d))}else{let a=i.data,d=pe(a.created_at),c=d!==o?d:"";if(o=d,s.has(a.id)){let E=ft(a,t);n.push(...Ke(a,c,E,t))}else n.push(Ve(a,c,t))}return n}function Vt(r,e,s,t,n){let o=[];o.push(...it(r));let i=null,a="";for(let d of e)if(d.type==="summary"){i=null,a="";let m=d.data,c=_e(m.displayTime);o.push(...mt(m,c))}else{let m=d.data,c=Tt(m.files_modified,n,m.files_read),l=pe(m.created_at),E=l!==a;a=l;let T=s.has(m.id);if(c!==i&&(o.push(...at(c)),i=c),T){let O=ft(m,t);o.push(...ut(m,l,E,O,t))}else o.push(dt(m,l,E,t))}return o.push(""),o}function Kt(r,e,s,t,n,o){return o?Vt(r,e,s,t,n):qt(r,e,s,t)}function St(r,e,s,t,n){let o=[],i=Yt(r);for(let[a,d]of i)o.push(...Kt(a,d,e,s,t,n));return o}function bt(r,e,s){return!(!r.showLastSummary||!e||!!!(e.investigated||e.learned||e.completed||e.next_steps)||s&&e.created_at_epoch<=s.created_at_epoch)}function ht(r,e){let s=[];return e?(s.push(...w("Investigated",r.investigated,u.blue)),s.push(...w("Learned",r.learned,u.yellow)),s.push(...w("Completed",r.completed,u.green)),s.push(...w("Next Steps",r.next_steps,u.magenta))):(s.push(...$("Investigated",r.investigated)),s.push(...$("Learned",r.learned)),s.push(...$("Completed",r.completed)),s.push(...$("Next Steps",r.next_steps))),s}function Ot(r,e){return e?ct(r):ze(r)}function At(r,e,s){return!q(e)||r.totalDiscoveryTokens<=0||r.savings<=0?[]:s?_t(r.totalDiscoveryTokens,r.totalReadTokens):Qe(r.totalDiscoveryTokens,r.totalReadTokens)}var Jt=Rt.default.join((0,It.homedir)(),".claude","plugins","marketplaces","thedotmack","plugin",".install-version");function zt(){try{return new X}catch(r){if(r.code==="ERR_DLOPEN_FAILED"){try{(0,Nt.unlinkSync)(Jt)}catch(e){_.debug("SYSTEM","Marker file cleanup failed (may not exist)",{},e)}return _.error("SYSTEM","Native module rebuild needed - restart Claude Code to auto-fix"),null}throw r}}function Qt(r,e){return e?pt(r):Ze(r)}function Zt(r,e,s,t,n,o,i){let a=[],d=ie(e);a.push(...lt(r,d,t,i));let m=s.slice(0,t.sessionCount),c=Fe(m,s),l=me(e,c),E=Pe(e,t.fullObservationCount);a.push(...St(l,E,t,n,i));let T=s[0],O=e[0];bt(t,T,O)&&a.push(...ht(T,i));let S=ue(e,t,o,n);return a.push(...Ot(S,i)),a.push(...At(d,t,i)),a.join(`
`).trimEnd()}async function le(r,e=!1){let s=re(),t=r?.cwd??process.cwd(),n=ye(t),o=n.primary,i=r?.platform_source,a=r?.projects??n.allProjects;r?.full&&(s.totalObservationCount=999999,s.sessionCount=999999);let d=zt();if(!d)return"";try{let m=a.length>1?$e(d,a,s,i):ae(d,o,s,i),c=a.length>1?we(d,a,s,i):de(d,o,s,i);return m.length===0&&c.length===0?Qt(o,e):Zt(o,m,c,s,t,r?.session_id,e)}finally{d.close()}}0&&(module.exports={generateContext});
