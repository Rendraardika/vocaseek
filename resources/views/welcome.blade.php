<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vocaseek - Temukan Pekerjaan Sesuai Skill</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        .btn-warning { background-color: #f1b922; border: none; border-radius: 20px; font-weight: bold; }
        .hero-section { padding: 60px 0; }
        .stat-card { border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; border-radius: 12px; }
        .category-card { border: 1px solid #eee; padding: 20px; border-radius: 12px; transition: 0.3s; text-align: left; }
        .category-card:hover { border-color: #f1b922; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .job-card { border: 1px solid #eee; padding: 15px; border-radius: 12px; margin-bottom: 10px; }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold text-primary" href="#">Vocaseek</a>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav m-auto">
                    <li class="nav-item"><a class="nav-link text-warning" href="#">Beranda</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Lowongan</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Mitra</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Tim</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">Kontak</a></li>
                </ul>
                <div class="d-flex">
                    @guest
                        <a href="{{ route('google.login') }}" class="btn btn-warning px-4">Masuk</a>
                    @endguest

                    @auth
                        <div class="dropdown">
                            <button class="btn btn-warning dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                {{ Auth::user()->nama }} </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <form action="{{ route('logout') }}" method="POST">
                                        @csrf
                                        <button type="submit" class="dropdown-item">Logout</button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <section class="hero-section container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold">Temukan pekerjaan sesuai <span class="text-warning">skill kalian!</span></h1>
                <p class="text-muted">Platform penyaluran karir terintegrasi untuk talenta muda Indonesia.</p>
                
                <form action="#" class="p-2 shadow-sm border rounded-pill d-flex bg-white">
                    <input type="text" class="form-control border-0 ms-2" placeholder="Job title, Keyword...">
                    <input type="text" class="form-control border-0" placeholder="Your Location">
                    <button class="btn btn-warning px-4 rounded-pill">Find Job</button>
                </form>
            </div>
            <div class="col-lg-6 text-center">
                <img src="https://via.placeholder.com/400x300" alt="Illustration" class="img-fluid">
            </div>
        </div>
    </section>

    <section class="container my-5">
        <div class="row text-center">
            <div class="col-md-3">
                <div class="stat-card bg-white">
                    <h3 class="fw-bold">{{ number_format($stats['live_jobs']) }}</h3> <p class="text-muted mb-0">Live Job</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-white">
                    <h3 class="fw-bold">{{ number_format($stats['companies']) }}</h3> <p class="text-muted mb-0">Companies</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-white">
                    <h3 class="fw-bold">{{ number_format($stats['candidates']) }}</h3> <p class="text-muted mb-0">Candidates</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card bg-white">
                    <h3 class="fw-bold">{{ number_format($stats['new_jobs']) }}</h3> <p class="text-muted mb-0">New Jobs</p>
                </div>
            </div>
        </div>
    </section>

    <section class="container my-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Bidang Kategori</h2>
            <a href="#" class="text-warning fw-bold text-decoration-none">View All →</a>
        </div>
        <div class="row g-4">
            @foreach($categories as $cat)
            <div class="col-md-3">
                <div class="category-card">
                    <i class="{{ $cat->icon }} fs-3 text-warning"></i> <h5 class="mt-3 fw-bold">{{ $cat->nama_kategori }}</h5> <p class="text-muted mb-0">{{ $cat->jobs_count }} Open position</p> </div>
            </div>
            @endforeach
        </div>
    </section>

    <section class="container my-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Featured job</h2>
            <a href="#" class="text-primary fw-bold text-decoration-none">View All →</a>
        </div>
        @foreach($featuredJobs as $job)
        <div class="job-card d-flex align-items-center justify-content-between bg-white shadow-sm">
            <div class="d-flex align-items-center">
                <div class="bg-light p-3 rounded me-3">
                    <i class="bi bi-buildings fs-4"></i>
                </div>
                <div>
                    <h5 class="mb-0 fw-bold">{{ $job->judul_pekerjaan }}</h5> <span class="badge bg-primary-subtle text-primary">{{ $job->tipe }}</span> <p class="text-muted mb-0 small"><i class="bi bi-geo-alt"></i> {{ $job->lokasi }} | {{ $job->perusahaan }}</p> </div>
            </div>
            <button class="btn btn-primary px-4 rounded-pill">Apply Now →</button>
        </div>
        @endforeach
    </section>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>