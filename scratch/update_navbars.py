import os

new_nav = """  <!-- Sticky Transparent Navbar -->
  <nav class="navbar navbar-expand-lg navbar-amira fixed-top" id="mainNavbar">
    <div class="container-fluid px-md-5 align-items-center justify-content-between position-relative">
      <!-- Toggle button for offcanvas (visible on mobile only) -->
      <button class="navbar-toggler border-0 p-0 text-dark" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbarOffcanvas" aria-controls="navbarOffcanvas" aria-label="Toggle navigation">
        <i class="bi bi-list fs-3"></i>
      </button>

      <!-- Brand Logo (always centered) -->
      <a class="navbar-brand-serif logo-centered" href="/">AMIRA</a>

      <!-- Cart Icon (always visible on right) -->
      <div class="d-flex align-items-center gap-2" style="z-index: 1100;">
        <a class="position-relative text-dark px-2" href="/cart.html" aria-label="View Cart">
          <i class="bi bi-bag fs-5"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge-pill d-none" id="cartCount">0</span>
        </a>
      </div>

      <!-- Offcanvas container for other items (sign up, login, currency toggle, category links) -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="navbarOffcanvas" aria-labelledby="navbarOffcanvasLabel">
        <div class="offcanvas-header border-bottom border-light">
          <h5 class="offcanvas-title font-display" id="navbarOffcanvasLabel">AMIRA</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-lg-between w-100 gap-4 gap-lg-0">
          <!-- Left side: Login/Account status -->
          <div id="navLeftContainer" class="order-2 order-lg-1 w-100 w-lg-auto">
            <a class="nav-btn-outline w-100 text-center" href="/login.html" id="navLoginBtn">Login</a>
          </div>
          
          <!-- Middle: Empty spacer on desktop to keep brand centered -->
          <div class="d-none d-lg-block order-lg-2 spacer-div" style="width: 1px;"></div>
          
          <!-- Right side: Sign Up, Currency Toggle -->
          <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 order-1 order-lg-3 w-100 w-lg-auto" id="navRightContainer">
            <a class="nav-btn-outline w-100 text-center" href="/signup.html" id="navSignupBtn">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  </nav>"""

public_dir = "C:\\Users\\HP\\.gemini\\antigravity\\scratch\\amira\\public"

for filename in os.listdir(public_dir):
    if filename.endswith(".html") and filename != "admin.html": # admin.html has a different admin-specific header
        filepath = os.path.join(public_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        id_idx = content.find('id="mainNavbar"')
        if id_idx != -1:
            start_idx = content.rfind('<nav', 0, id_idx)
            end_idx = content.find('</nav>', id_idx)
            if start_idx != -1 and end_idx != -1:
                old_nav = content[start_idx:end_idx + len('</nav>')]
                updated_content = content.replace(old_nav, new_nav)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(updated_content)
                print(f"Updated navbar in: {filename}")
            else:
                print(f"Error: Indices error in {filename}")
        else:
            print(f"Skipped (no mainNavbar): {filename}")
