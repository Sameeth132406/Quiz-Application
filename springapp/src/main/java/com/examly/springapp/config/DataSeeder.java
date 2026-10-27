package com.examly.springapp.config;

import com.examly.springapp.enums.ContentType;
import com.examly.springapp.enums.CourseStatus;
import com.examly.springapp.enums.Difficulty;
import com.examly.springapp.enums.QuestionType;
import com.examly.springapp.enums.Role;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.CourseContent;
import com.examly.springapp.model.CourseModule;
import com.examly.springapp.model.Question;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.CourseContentRepository;
import com.examly.springapp.repository.CourseModuleRepository;
import com.examly.springapp.repository.CourseRepository;
import com.examly.springapp.repository.QuestionRepository;
import com.examly.springapp.repository.QuizRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Find default educator to assign ownership
        User educator = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EDUCATOR || u.getRole() == Role.ADMIN)
                .findFirst()
                .orElse(null);

        Long educatorId = educator != null ? educator.getId() : 1L;
        String educatorName = educator != null ? educator.getUsername() : "Dr. Alex Rivera";

        // =========================================================================
        // 1. Python for Modern Software Engineering & Data Analytics
        // =========================================================================
        if (!courseRepository.existsByTitle("Python for Modern Software Engineering & Data Analytics")) {
            // A. Create Quiz
            Quiz pyQuiz = createQuizIfNotExists(
                    "Python Software Engineering & OOP Assessment",
                    "Comprehensive assessment evaluating core OOP patterns, decorators, generators, asyncio, and memory optimization.",
                    "Python Programming",
                    Difficulty.MEDIUM,
                    30
            );

            createQuestionIfNotExists(pyQuiz.getId(),
                    "What happens under the hood when a Python class defines '__slots__ = (\"name\", \"age\")'?",
                    "Python avoids creating a per-instance __dict__ dictionary, dramatically reducing memory usage and preventing dynamic attribute assignment.",
                    "It automatically creates private getters and setters for the specified attributes.",
                    "It enforces strict static type checking during runtime for name and age.",
                    "It compiles the class into native C bytecode for faster execution.",
                    "A", 1);

            createQuestionIfNotExists(pyQuiz.getId(),
                    "Which built-in Python module is used to write concurrent code using the async/await syntax?",
                    "multiprocessing",
                    "threading",
                    "asyncio",
                    "concurrent.futures",
                    "C", 1);

            createQuestionIfNotExists(pyQuiz.getId(),
                    "In Python, what is the key difference between a normal function and a generator function?",
                    "Generators run on a separate CPU thread, while normal functions run synchronously.",
                    "Generators use the 'yield' keyword to produce values lazily on-demand without holding the entire sequence in memory.",
                    "Generators cannot accept parameters, whereas normal functions can.",
                    "Generators are automatically memoized and cached by Python's runtime.",
                    "B", 1);

            createQuestionIfNotExists(pyQuiz.getId(),
                    "What is the role of 'functools.wraps' when defining a custom function decorator in Python?",
                    "It compiles the wrapped function into a fast C extension.",
                    "It preserves the original function's metadata such as __name__, __doc__, and type signatures.",
                    "It ensures the decorated function can only be executed asynchronously.",
                    "It enforces argument validation on every function invocation.",
                    "B", 1);

            // B. Create Course
            Course pyCourse = new Course();
            pyCourse.setTitle("Python for Modern Software Engineering & Data Analytics");
            pyCourse.setCourseName("Python for Modern Software Engineering & Data Analytics");
            pyCourse.setCourseCode("PY-401");
            pyCourse.setDescription("Master modern Python 3.12+, Object-Oriented Architecture, Metaclasses, Generators, Decorators, Concurrency with Asyncio, and Production Software Engineering.");
            pyCourse.setCategory("Programming & Data Science");
            pyCourse.setDifficulty(Difficulty.MEDIUM);
            pyCourse.setDuration("8 Weeks • 32 Hours");
            pyCourse.setStatus(CourseStatus.PUBLISHED);
            pyCourse.setEducatorId(educatorId);
            pyCourse.setCreatedBy(educatorName);
            pyCourse.setInstructor(educatorName);
            pyCourse.setCreatedAt(LocalDateTime.now());
            pyCourse.setUpdatedAt(LocalDateTime.now());
            pyCourse = courseRepository.save(pyCourse);

            // C. Create Modules
            CourseModule m1 = createModule(pyCourse.getId(), "Module 1: Modern Python Architecture & Functional Patterns",
                    "Deep-dive into type annotations, protocols, generator pipelines, and itertools.", 1, null);
            createContent(m1.getId(), "Modern Type Annotations & Protocol Classes", ContentType.TEXT,
                    "### Modern Type Annotations in Python 3.12+\n\nPython now supports generic type aliases, structural subtyping via `typing.Protocol`, and runtime type validation. Understanding protocols allows clean duck-typing without tight inheritance coupling.", 1, "20 mins");
            createContent(m1.getId(), "Generator Pipelines & Memory Optimization with Itertools", ContentType.TEXT,
                    "### Generator Pipelines\n\nWhen processing large streaming datasets, generators allow constant O(1) memory overhead. Chain multiple generators together using `yield from` and `itertools.islice`.", 2, "25 mins");

            CourseModule m2 = createModule(pyCourse.getId(), "Module 2: Advanced OOP, Metaclasses & Magic Methods",
                    "Explore the Python data model, __slots__, custom descriptors, and dynamic class creation.", 2, null);
            createContent(m2.getId(), "Understanding the Data Model & Dunder Methods", ContentType.TEXT,
                    "### Python's Data Model\n\nEvery Python class leverages special methods such as `__new__`, `__init__`, `__enter__`, and `__exit__`. By mastering descriptors, you can implement custom ORMs and attribute validation.", 1, "30 mins");

            CourseModule m3 = createModule(pyCourse.getId(), "Module 3: Asynchronous Concurrency with Asyncio",
                    "Building event loops, coroutines, worker tasks, and scalable network services.", 3, null);
            createContent(m3.getId(), "Asyncio Event Loop Internals & Task Scheduling", ContentType.TEXT,
                    "### Asyncio Concurrency\n\nUnlike OS threads, asyncio relies on cooperative multitasking. Learn how to manage `asyncio.gather()`, handle task cancellations, and prevent event loop blocking.", 1, "35 mins");

            createModule(pyCourse.getId(), "Module 4: Capstone Assessment: Python Mastery Examination",
                    "Evaluate your comprehension across Python OOP, concurrency, generators, and packaging.", 4, pyQuiz.getId());
        }

        // =========================================================================
        // 2. Full-Stack JavaScript & Modern TypeScript Masterclass
        // =========================================================================
        if (!courseRepository.existsByTitle("Full-Stack JavaScript & Modern TypeScript Masterclass")) {
            Quiz jsQuiz = createQuizIfNotExists(
                    "JavaScript V8 Internals & TypeScript Mastery Quiz",
                    "Challenging evaluation covering the V8 Event Loop, Microtask Queue, TypeScript Generics, and Fiber Reconciliation.",
                    "JavaScript & TypeScript",
                    Difficulty.MEDIUM,
                    30
            );

            createQuestionIfNotExists(jsQuiz.getId(),
                    "In the JavaScript Event Loop, which queue has higher execution priority after the current call stack clears?",
                    "Macrotask queue (setTimeout, setInterval)",
                    "Microtask queue (Promise.then, queueMicrotask, MutationObserver)",
                    "I/O polling queue",
                    "UI rendering requestAnimationFrame queue",
                    "B", 1);

            createQuestionIfNotExists(jsQuiz.getId(),
                    "In TypeScript, what is the purpose of the 'keyof' type operator?",
                    "It returns an array of object values at runtime.",
                    "It creates a union type containing all public property names of a given type.",
                    "It verifies whether a key exists in a Map data structure.",
                    "It encrypts object keys for secure network transfer.",
                    "B", 1);

            createQuestionIfNotExists(jsQuiz.getId(),
                    "What is the primary benefit of React Fiber's incremental rendering architecture?",
                    "It completely replaces JavaScript with WebAssembly for rendering.",
                    "It breaks rendering work into small units and pauses work to yield control back to the browser for smooth 60fps responsiveness.",
                    "It forces all state updates to execute synchronously.",
                    "It compiles React components directly into native iOS and Android binaries.",
                    "B", 1);

            createQuestionIfNotExists(jsQuiz.getId(),
                    "Which TypeScript utility type constructs a type with all properties of Type set to optional?",
                    "Required<T>",
                    "Record<K, T>",
                    "Partial<T>",
                    "Pick<T, K>",
                    "C", 1);

            Course jsCourse = new Course();
            jsCourse.setTitle("Full-Stack JavaScript & Modern TypeScript Masterclass");
            jsCourse.setCourseName("Full-Stack JavaScript & Modern TypeScript Masterclass");
            jsCourse.setCourseCode("JS-301");
            jsCourse.setDescription("Deep-dive into modern JavaScript (ES2024), TypeScript type safety, the V8 Event Loop, Promises, Async/Await, and scalable React application design.");
            jsCourse.setCategory("Web Development");
            jsCourse.setDifficulty(Difficulty.MEDIUM);
            jsCourse.setDuration("10 Weeks • 40 Hours");
            jsCourse.setStatus(CourseStatus.PUBLISHED);
            jsCourse.setEducatorId(educatorId);
            jsCourse.setCreatedBy(educatorName);
            jsCourse.setInstructor(educatorName);
            jsCourse.setCreatedAt(LocalDateTime.now());
            jsCourse.setUpdatedAt(LocalDateTime.now());
            jsCourse = courseRepository.save(jsCourse);

            CourseModule m1 = createModule(jsCourse.getId(), "Module 1: V8 Engine Internals & Asynchronous Execution",
                    "Memory heap, call stack, microtask vs macrotask execution order.", 1, null);
            createContent(m1.getId(), "V8 Event Loop, Call Stack & Microtask Queues", ContentType.TEXT,
                    "### The V8 Event Loop\n\nJavaScript is single-threaded, but modern runtimes achieve high throughput using the event loop. Microtasks (promises) always drain completely before the next macrotask is dequeued.", 1, "25 mins");

            CourseModule m2 = createModule(jsCourse.getId(), "Module 2: Advanced TypeScript Generics & Type Guards",
                    "Master utility types, conditional types, mapped types, and discriminated unions.", 2, null);
            createContent(m2.getId(), "Conditional Types & Discriminated Unions", ContentType.TEXT,
                    "### TypeScript Type Gymnastics\n\nLeverage `T extends U ? X : Y` and mapped types to build type-safe API clients, form validators, and Redux/Zustand state managers.", 1, "30 mins");

            CourseModule m3 = createModule(jsCourse.getId(), "Module 3: React Architecture & Performance Optimization",
                    "Virtual DOM diffing, Fiber reconciliation, memoization with useMemo & useCallback.", 3, null);
            createContent(m3.getId(), "React Fiber Reconciliation & Profiler Analysis", ContentType.TEXT,
                    "### React Fiber Mechanics\n\nUnderstand how React splits rendering work across frames, how closures interact with hooks, and how to eliminate unnecessary component re-renders.", 1, "30 mins");

            createModule(jsCourse.getId(), "Module 4: Capstone Evaluation: Full-Stack JavaScript & TS Assessment",
                    "Validate your mastery of modern JavaScript runtimes and TypeScript systems.", 4, jsQuiz.getId());
        }

        // =========================================================================
        // 3. Go (Golang) Systems & High-Performance Microservices
        // =========================================================================
        if (!courseRepository.existsByTitle("Go (Golang) Systems & High-Performance Microservices")) {
            Quiz goQuiz = createQuizIfNotExists(
                    "Golang Concurrency, Channels & Systems Assessment",
                    "Advanced systems evaluation testing Goroutines, Channel buffering, Select statements, and Context cancellation.",
                    "Go Programming",
                    Difficulty.HARD,
                    35
            );

            createQuestionIfNotExists(goQuiz.getId(),
                    "What happens when you send data to an unbuffered Go channel that has no active receiver waiting?",
                    "The sender immediately crashes with a panic: channel full.",
                    "The sending goroutine blocks until another goroutine receives from the channel.",
                    "The data is automatically queued in system RAM indefinitely.",
                    "The channel drops the packet and returns a timeout error.",
                    "B", 1);

            createQuestionIfNotExists(goQuiz.getId(),
                    "In Go, how does the Go runtime handle memory allocation with respect to Escape Analysis?",
                    "All variables are always allocated on the heap regardless of scope.",
                    "The compiler determines whether a variable can be safely allocated on the stack or must escape to the heap based on reference lifetime outside the stack frame.",
                    "The programmer must manually call malloc() and free() like in C.",
                    "Variables are allocated on the stack only if they implement the Sync interface.",
                    "B", 1);

            createQuestionIfNotExists(goQuiz.getId(),
                    "What is the primary role of the 'context.Context' package in Go microservices?",
                    "To compress HTTP responses with gzip.",
                    "To propagate request deadlines, cancellation signals, and request-scoped values across API boundaries and goroutines.",
                    "To manage database connection connection pools automatically.",
                    "To compile Go code into WebAssembly binaries.",
                    "B", 1);

            createQuestionIfNotExists(goQuiz.getId(),
                    "How does a 'select' statement behave in Go when multiple channels are simultaneously ready for communication?",
                    "It executes the first case listed in code order sequentially.",
                    "It chooses one of the ready cases pseudo-randomly to prevent channel starvation.",
                    "It throws a runtime deadlock exception.",
                    "It executes all ready cases concurrently in parallel goroutines.",
                    "B", 1);

            Course goCourse = new Course();
            goCourse.setTitle("Go (Golang) Systems & High-Performance Microservices");
            goCourse.setCourseName("Go (Golang) Systems & High-Performance Microservices");
            goCourse.setCourseCode("GO-501");
            goCourse.setDescription("Build ultra-fast, concurrent network applications and microservices using Go. Master Goroutines, Channels, Mutexes, Context API, and gRPC communication.");
            goCourse.setCategory("Backend & Systems");
            goCourse.setDifficulty(Difficulty.HARD);
            goCourse.setDuration("6 Weeks • 24 Hours");
            goCourse.setStatus(CourseStatus.PUBLISHED);
            goCourse.setEducatorId(educatorId);
            goCourse.setCreatedBy(educatorName);
            goCourse.setInstructor(educatorName);
            goCourse.setCreatedAt(LocalDateTime.now());
            goCourse.setUpdatedAt(LocalDateTime.now());
            goCourse = courseRepository.save(goCourse);

            CourseModule m1 = createModule(goCourse.getId(), "Module 1: Go Memory Model, Pointers & Escape Analysis",
                    "Stack vs heap allocation, pointers, value receivers vs pointer receivers.", 1, null);
            createContent(m1.getId(), "Escape Analysis & Memory Profiling with pprof", ContentType.TEXT,
                    "### Go Memory Allocation\n\nLearn how `go build -gcflags='-m'` reveals variable escapes, and how to write zero-allocation loops to minimize Garbage Collector pressure.", 1, "25 mins");

            CourseModule m2 = createModule(goCourse.getId(), "Module 2: Concurrency Mastery: Goroutines & Channels",
                    "CSP model, buffered vs unbuffered channels, worker pools and sync.WaitGroup.", 2, null);
            createContent(m2.getId(), "Building Scalable Worker Pools with Select & Context", ContentType.TEXT,
                    "### Worker Pool Architecture\n\nImplement backpressure, graceful shutdown mechanisms, and resilient worker pools that never leak goroutines.", 1, "30 mins");

            createModule(goCourse.getId(), "Module 3: Capstone Evaluation: Go Systems Assessment",
                    "Test your expertise in Go concurrency, channels, interfaces, and microservices.", 3, goQuiz.getId());
        }

        // =========================================================================
        // 4. Rust Programming: Memory Safety & Systems Performance
        // =========================================================================
        if (!courseRepository.existsByTitle("Rust Programming: Memory Safety & Systems Performance")) {
            Quiz rustQuiz = createQuizIfNotExists(
                    "Rust Ownership, Lifetimes & Safety Quiz",
                    "Rigorous assessment covering Rust Ownership, Borrow Checker, Lifetimes, and Smart Pointers.",
                    "Rust Programming",
                    Difficulty.HARD,
                    35
            );

            createQuestionIfNotExists(rustQuiz.getId(),
                    "What are the three fundamental rules of Rust's Ownership system?",
                    "1. Memory is always managed by a garbage collector. 2. All pointers must be raw. 3. Every thread has its own heap.",
                    "1. Each value has an owner. 2. There can only be one owner at a time. 3. When the owner goes out of scope, the value is dropped.",
                    "1. Values are copied by default. 2. Pointers can be null. 3. Memory leaks are impossible.",
                    "1. Functions must be pure. 2. Variables are mutable by default. 3. Structures cannot hold references.",
                    "B", 1);

            createQuestionIfNotExists(rustQuiz.getId(),
                    "Under Rust's borrowing rules, which of the following is strictly prohibited by the compiler?",
                    "Having multiple immutable references (&T) to a value simultaneously.",
                    "Having a mutable reference (&mut T) while any other reference (&T or &mut T) exists in the same scope.",
                    "Passing an immutable reference to a pure function.",
                    "Re-borrowing an immutable reference inside a child block.",
                    "B", 1);

            createQuestionIfNotExists(rustQuiz.getId(),
                    "Which smart pointer type in Rust enables multiple ownership across multiple threads concurrently?",
                    "Rc<T>",
                    "Box<T>",
                    "Arc<T>",
                    "RefCell<T>",
                    "C", 1);

            createQuestionIfNotExists(rustQuiz.getId(),
                    "What does a lifetime annotation (such as 'a) in a Rust function signature actually tell the compiler?",
                    "It specifies how many CPU cycles the function is allowed to run.",
                    "It informs the borrow checker about the relationship between the lifetimes of multiple references so invalid references are rejected at compile time.",
                    "It dynamically allocates heap memory for the duration of the function.",
                    "It tells the runtime to skip borrow checking for that specific variable.",
                    "B", 1);

            Course rustCourse = new Course();
            rustCourse.setTitle("Rust Programming: Memory Safety & Systems Performance");
            rustCourse.setCourseName("Rust Programming: Memory Safety & Systems Performance");
            rustCourse.setCourseCode("RS-601");
            rustCourse.setDescription("Master memory safety without garbage collection. Explore Rust's ownership model, borrowing rules, lifetimes, smart pointers (Box, Rc, Arc), and fearless concurrency.");
            rustCourse.setCategory("Systems Programming");
            rustCourse.setDifficulty(Difficulty.HARD);
            rustCourse.setDuration("8 Weeks • 30 Hours");
            rustCourse.setStatus(CourseStatus.PUBLISHED);
            rustCourse.setEducatorId(educatorId);
            rustCourse.setCreatedBy(educatorName);
            rustCourse.setInstructor(educatorName);
            rustCourse.setCreatedAt(LocalDateTime.now());
            rustCourse.setUpdatedAt(LocalDateTime.now());
            rustCourse = courseRepository.save(rustCourse);

            CourseModule m1 = createModule(rustCourse.getId(), "Module 1: Ownership, Borrowing & Lifetimes",
                    "Understand how the Rust borrow checker prevents data races, dangling pointers, and double-free bugs.", 1, null);
            createContent(m1.getId(), "The Ownership Model & Non-Lexical Lifetimes", ContentType.TEXT,
                    "### Fearless Systems Programming\n\nRust achieves C++ level performance with complete memory safety through compile-time ownership tracking and zero-cost abstractions.", 1, "30 mins");

            CourseModule m2 = createModule(rustCourse.getId(), "Module 2: Smart Pointers & Concurrency Without Races",
                    "Box, Rc, RefCell, Arc, Mutex and thread-safe data pipelines.", 2, null);
            createContent(m2.getId(), "Shared State Concurrency with Arc<Mutex<T>>", ContentType.TEXT,
                    "### Multi-threaded Rust\n\nLearn how the Send and Sync traits prevent data races at compile time when transferring data across thread boundaries.", 1, "35 mins");

            createModule(rustCourse.getId(), "Module 3: Capstone Evaluation: Rust Ownership & Systems Assessment",
                    "Demonstrate your mastery of Rust ownership, lifetimes, and safety guarantees.", 3, rustQuiz.getId());
        }

        // =========================================================================
        // 5. Relational Databases & Advanced SQL Engineering
        // =========================================================================
        if (!courseRepository.existsByTitle("Relational Databases & Advanced SQL Engineering")) {
            Quiz sqlQuiz = createQuizIfNotExists(
                    "Advanced SQL & Database Indexing Quiz",
                    "Engineering assessment testing Window Functions, Index Internals, Isolation Levels, and Execution Plans.",
                    "Database Engineering",
                    Difficulty.MEDIUM,
                    30
            );

            createQuestionIfNotExists(sqlQuiz.getId(),
                    "In relational database indexing, what does the 'Leftmost Prefix Rule' dictate for composite indexes on (A, B, C)?",
                    "The index can only be used if column C is present in the WHERE clause.",
                    "Queries filtering on (A) or (A, B) or (A, B, C) can utilize the index, but queries filtering only on (B, C) cannot effectively use the index.",
                    "The index forces all query results to be sorted in reverse descending order.",
                    "The index only applies to INSERT operations, not SELECT statements.",
                    "B", 1);

            createQuestionIfNotExists(sqlQuiz.getId(),
                    "What is the difference between ROW_NUMBER() and DENSE_RANK() window functions when encountering identical score ties?",
                    "ROW_NUMBER assigns unique sequential integers without ties, while DENSE_RANK assigns the same rank to ties without skipping subsequent rank numbers.",
                    "ROW_NUMBER skips numbers after ties, while DENSE_RANK does not allow ties.",
                    "DENSE_RANK only works on integer primary keys, whereas ROW_NUMBER works on any column.",
                    "There is no difference; they are aliases for the same function.",
                    "A", 1);

            createQuestionIfNotExists(sqlQuiz.getId(),
                    "Under ANSI SQL Transaction Isolation Levels, which level protects against both Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads?",
                    "READ UNCOMMITTED",
                    "READ COMMITTED",
                    "REPEATABLE READ",
                    "SERIALIZABLE",
                    "C", 1);

            createQuestionIfNotExists(sqlQuiz.getId(),
                    "What is the primary indicator of an unoptimized query in an EXPLAIN execution plan?",
                    "Using an Index Seek or Range Scan on the primary key.",
                    "A Full Table Scan (ALL) examining millions of rows without index usage.",
                    "Returning a result set in under 5 milliseconds.",
                    "Using a Nested Loop Join on indexed foreign keys.",
                    "B", 1);

            Course sqlCourse = new Course();
            sqlCourse.setTitle("Relational Databases & Advanced SQL Engineering");
            sqlCourse.setCourseName("Relational Databases & Advanced SQL Engineering");
            sqlCourse.setCourseCode("DB-401");
            sqlCourse.setDescription("Design scalable relational schemas, optimize complex queries with execution plans (EXPLAIN), understand B-Tree index internals, and handle ACID transactions.");
            sqlCourse.setCategory("Database Engineering");
            sqlCourse.setDifficulty(Difficulty.MEDIUM);
            sqlCourse.setDuration("6 Weeks • 20 Hours");
            sqlCourse.setStatus(CourseStatus.PUBLISHED);
            sqlCourse.setEducatorId(educatorId);
            sqlCourse.setCreatedBy(educatorName);
            sqlCourse.setInstructor(educatorName);
            sqlCourse.setCreatedAt(LocalDateTime.now());
            sqlCourse.setUpdatedAt(LocalDateTime.now());
            sqlCourse = courseRepository.save(sqlCourse);

            CourseModule m1 = createModule(sqlCourse.getId(), "Module 1: Relational Architecture & Normalization",
                    "1NF, 2NF, 3NF, BCNF, constraints, and denormalization trade-offs.", 1, null);
            createContent(m1.getId(), "Database Normalization & Integrity Constraints", ContentType.TEXT,
                    "### Relational Modeling\n\nMaster the balance between normalization for transactional correctness and strategic denormalization for read performance.", 1, "20 mins");

            CourseModule m2 = createModule(sqlCourse.getId(), "Module 2: Advanced SQL: Window Functions & CTEs",
                    "Analytics queries using ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG and recursive queries.", 2, null);
            createContent(m2.getId(), "Window Functions & Analytics Query Design", ContentType.TEXT,
                    "### SQL Window Functions\n\nPerform running totals, cohort analyses, and student rank calculations without expensive self-joins.", 1, "25 mins");

            CourseModule m3 = createModule(sqlCourse.getId(), "Module 3: Indexing Internals & Query Optimization",
                    "B-Trees, composite indexes, execution plans (EXPLAIN), and query tuning.", 3, null);
            createContent(m3.getId(), "B-Tree Internals & Reading Execution Plans", ContentType.TEXT,
                    "### Index Engineering\n\nLearn how database storage engines store clustered vs non-clustered indexes on disk and how to eliminate slow table scans.", 1, "30 mins");

            createModule(sqlCourse.getId(), "Module 4: Capstone Evaluation: Advanced SQL & Indexing Assessment",
                    "Test your expertise in SQL optimization, indexing, and transactional isolation.", 4, sqlQuiz.getId());
        }

        // =========================================================================
        // 6. Java Spring Boot & Cloud Microservices Quiz
        // =========================================================================
        Quiz javaQuiz = createQuizIfNotExists(
                "Java Spring Boot & Cloud Microservices Quiz",
                "Advanced enterprise engineering quiz testing Spring Bean Lifecycle, Transaction Isolation, Circuit Breakers, and Hibernate N+1 optimization.",
                "Java & Microservices",
                Difficulty.HARD,
                30
        );

        createQuestionIfNotExists(javaQuiz.getId(),
                "In Spring Framework, how does @Transactional behave when a method is called from another method within the same bean class (self-invocation)?",
                "The transaction starts normally because Spring instruments all bytecode.",
                "The @Transactional annotation is bypassed because the call bypasses the Spring CGLIB/JDK dynamic proxy.",
                "Spring throws an IllegalTransactionStateException immediately.",
                "The transaction runs in a separate isolated thread pool automatically.",
                "B", 1);

        createQuestionIfNotExists(javaQuiz.getId(),
                "What is the most effective solution to eliminate the Hibernate N+1 query problem when fetching related entities?",
                "Use fetch = FetchType.EAGER on all associations.",
                "Use JOIN FETCH in JPQL queries or @EntityGraph to eagerly fetch associations in a single SQL query.",
                "Increase the database connection pool maximum size.",
                "Disable second-level caching across Hibernate configurations.",
                "B", 1);

        createQuestionIfNotExists(javaQuiz.getId(),
                "In Spring Cloud / Resilience4j, what are the three primary states of a Circuit Breaker?",
                "STARTING, RUNNING, STOPPED",
                "CLOSED (normal calls), OPEN (calls fail fast), HALF_OPEN (trial calls permitted)",
                "INITIALIZING, ACTIVE, DEGRADED",
                "STABLE, RETRYING, ABORTED",
                "B", 1);

        createQuestionIfNotExists(javaQuiz.getId(),
                "Which HTTP header should be parsed in a OncePerRequestFilter to extract the Bearer token for Spring Security JWT authentication?",
                "X-Auth-Token",
                "Authorization",
                "Proxy-Authenticate",
                "User-Token",
                "B", 1);

        // =========================================================================
        // 7. DevOps, Docker & Kubernetes Engineering Quiz
        // =========================================================================
        Quiz k8sQuiz = createQuizIfNotExists(
                "DevOps, Docker & Kubernetes Engineering Quiz",
                "Industry evaluation on containerization, Pod lifecycle, Helm charts, Rolling Updates, and CI/CD pipelines.",
                "Cloud & DevOps",
                Difficulty.MEDIUM,
                25
        );

        createQuestionIfNotExists(k8sQuiz.getId(),
                "Why are multi-stage Docker builds recommended for production Go or Java container images?",
                "They allow running multiple web servers inside a single Docker container simultaneously.",
                "They separate the build environment (compilers/SDKs) from the runtime environment, resulting in dramatically smaller and more secure production images.",
                "They enable running Docker containers without an underlying Linux kernel.",
                "They automatically encrypt the container filesystem with AES-256.",
                "B", 1);

        createQuestionIfNotExists(k8sQuiz.getId(),
                "In Kubernetes, what is the key difference between a Liveness Probe and a Readiness Probe?",
                "Liveness checks if the Pod can accept network traffic; Readiness restarts the container if it fails.",
                "Liveness checks if the container is still alive and restarts it if failed; Readiness checks if the container is ready to accept incoming traffic before routing requests to it.",
                "Both probes perform identical actions and are strictly interchangeable aliases.",
                "Readiness probes only execute during node startup.",
                "B", 1);

        createQuestionIfNotExists(k8sQuiz.getId(),
                "Which Kubernetes resource provides declarative updates for Pods and ReplicaSets, supporting zero-downtime rolling updates?",
                "StatefulSet",
                "DaemonSet",
                "Deployment",
                "Job",
                "C", 1);

        createQuestionIfNotExists(k8sQuiz.getId(),
                "What is the function of a Kubernetes Ingress Controller?",
                "It manages database replication across multi-region clusters.",
                "It acts as a reverse proxy and load balancer to route external HTTP/S traffic to internal cluster Services based on hostnames or paths.",
                "It compiles container source code into Kubernetes manifests.",
                "It automatically scales Kubernetes worker nodes on cloud providers.",
                "B", 1);
    }

    private Quiz createQuizIfNotExists(String title, String desc, String category, Difficulty diff, int duration) {
        return quizRepository.findAll().stream()
                .filter(q -> title.equalsIgnoreCase(q.getTitle()))
                .findFirst()
                .orElseGet(() -> {
                    Quiz q = new Quiz();
                    q.setTitle(title);
                    q.setDescription(desc);
                    q.setCategory(category);
                    q.setDifficulty(diff);
                    q.setDuration(duration);
                    q.setResultsPublished(true); // Published by default for student learning
                    return quizRepository.save(q);
                });
    }

    private void createQuestionIfNotExists(Long quizId, String text, String optA, String optB, String optC, String optD, String ans, int marks) {
        boolean exists = questionRepository.findAll().stream()
                .anyMatch(q -> quizId.equals(q.getQuizId()) && text.equalsIgnoreCase(q.getQuestionText()));
        if (!exists) {
            Question q = new Question();
            q.setQuizId(quizId);
            q.setQuestionText(text);
            q.setOptionA(optA);
            q.setOptionB(optB);
            q.setOptionC(optC);
            q.setOptionD(optD);
            q.setCorrectAnswer(ans);
            q.setQuestionType(QuestionType.MULTIPLE_CHOICE);
            q.setMarks(marks);
            questionRepository.save(q);
        }
    }

    private CourseModule createModule(Long courseId, String title, String desc, int order, Long quizId) {
        CourseModule m = new CourseModule();
        m.setCourseId(courseId);
        m.setTitle(title);
        m.setDescription(desc);
        m.setModuleOrder(order);
        m.setQuizId(quizId);
        m.setCreatedAt(LocalDateTime.now());
        m.setUpdatedAt(LocalDateTime.now());
        return courseModuleRepository.save(m);
    }

    private CourseContent createContent(Long moduleId, String title, ContentType type, String text, int order, String duration) {
        CourseContent c = new CourseContent();
        c.setModuleId(moduleId);
        c.setTitle(title);
        c.setContentType(type);
        c.setTextContent(text);
        c.setContentOrder(order);
        c.setDuration(duration);
        c.setDescription(title);
        c.setIsDownloadable(true);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return courseContentRepository.save(c);
    }
}
