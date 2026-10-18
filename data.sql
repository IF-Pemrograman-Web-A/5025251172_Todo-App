CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NULL,
    notification_time TIMESTAMP NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    scope VARCHAR(10) NOT NULL DEFAULT 'personal'
        CHECK (scope IN ('personal', 'shared')),
    image_path VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks
    (title, description, due_date, notification_time, is_completed, scope)
VALUES
    (
        'Belajar PHP',
        'Mempelajari dasar PHP dan koneksi database.',
        '2026-10-20 20:00:00',
        '2026-10-20 19:30:00',
        FALSE,
        'personal'
    ),
    (
        'ETS KPPL',
        'Menyelesaikan soal Use Case Diagram.',
        '2026-10-25 20:00:00',
        NULL,
        FALSE,
        'shared'
    ),
    (
        'Membaca materi ETS Pemrograman Web',
        'Mempelajari materi-materi yang ada di PPT.',
        NULL,
        NULL,
        FALSE,
        'personal'
    );

SELECT * FROM tasks;	
