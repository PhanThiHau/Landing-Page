/**
 * TIMA.VN - SÀN KẾT NỐI TÀI CHÍNH HÀNG ĐẦU VIỆT NAM
 * Interactive Application Logic & Loan Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===================================================================
  // 1. LOAN CALCULATOR CONFIG & STATE
  // ===================================================================
  const loanConfig = {
    cccd: {
      min: 3000000,
      max: 50000000,
      step: 1000000,
      defaultVal: 20000000,
      interestRateMonth: 0.0108, // 1.08% / month
      chips: [
        { label: '5 Triệu', value: 5000000 },
        { label: '10 Triệu', value: 10000000 },
        { label: '20 Triệu', value: 20000000 },
        { label: '35 Triệu', value: 35000000 },
        { label: '50 Triệu', value: 50000000 }
      ],
      periods: [3, 6, 9, 12]
    },
    motorbike: {
      min: 3000000,
      max: 50000000,
      step: 1000000,
      defaultVal: 20000000,
      interestRateMonth: 0.0108, // 1.08% / month
      chips: [
        { label: '5 Triệu', value: 5000000 },
        { label: '10 Triệu', value: 10000000 },
        { label: '20 Triệu', value: 20000000 },
        { label: '35 Triệu', value: 35000000 },
        { label: '50 Triệu', value: 50000000 }
      ],
      periods: [3, 6, 9, 12]
    },
    car: {
      min: 30000000,
      max: 2000000000,
      step: 10000000,
      defaultVal: 300000000,
      interestRateMonth: 0.0108, // 1.08% / month
      chips: [
        { label: '100 Triệu', value: 100000000 },
        { label: '300 Triệu', value: 300000000 },
        { label: '500 Triệu', value: 500000000 },
        { label: '1 Tỷ', value: 1000000000 },
        { label: '2 Tỷ', value: 2000000000 }
      ],
      periods: [6, 12, 18, 24, 36]
    }
  };

  let currentState = {
    type: 'cccd',
    amount: 20000000,
    period: 12
  };

  // DOM Elements
  const tabCccd = document.getElementById('tabCccd');
  const tabMotorbike = document.getElementById('tabMotorbike');
  const tabCar = document.getElementById('tabCar');
  const amountSlider = document.getElementById('amountSlider');
  const amountDisplay = document.getElementById('amountDisplay');
  const minAmountLabel = document.getElementById('minAmountLabel');
  const maxAmountLabel = document.getElementById('maxAmountLabel');
  const quickChipsContainer = document.getElementById('quickChipsContainer');
  const periodButtonsContainer = document.getElementById('periodButtonsContainer');

  const resultPrincipal = document.getElementById('resultPrincipal');
  const resultInterest = document.getElementById('resultInterest');
  const resultMonthlyPay = document.getElementById('resultMonthlyPay');
  const resultPeriodLabel = document.getElementById('resultPeriodLabel');
  const summaryAmountText = document.getElementById('summaryAmountText');

  // Format currency VNĐ
  function formatVND(number) {
    return new Intl.NumberFormat('vi-VN').format(number) + ' đ';
  }

  function formatShortNumber(number) {
    if (number >= 1000000000) {
      return (number / 1000000000).toFixed(0) + ' Tỷ';
    }
    return (number / 1000000).toFixed(0) + ' Triệu';
  }

  // Render Quick Chips for amount
  function renderChips() {
    if (!quickChipsContainer) return;
    quickChipsContainer.innerHTML = '';
    const cfg = loanConfig[currentState.type];
    if (!cfg || !cfg.chips) return;
    cfg.chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-btn ${currentState.amount === chip.value ? 'active' : ''}`;
      btn.innerText = chip.label;
      btn.addEventListener('click', () => {
        currentState.amount = chip.value;
        if (amountSlider) amountSlider.value = chip.value;
        updateCalculator();
      });
      quickChipsContainer.appendChild(btn);
    });
  }

  // Render Period buttons
  function renderPeriods() {
    if (!periodButtonsContainer) return;
    periodButtonsContainer.innerHTML = '';
    const cfg = loanConfig[currentState.type];
    if (!cfg || !cfg.periods) return;
    
    // Default to first valid period if current period not in list
    if (!cfg.periods.includes(currentState.period)) {
      currentState.period = cfg.periods[cfg.periods.length - 1];
    }

    cfg.periods.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `period-btn ${currentState.period === p ? 'active' : ''}`;
      btn.innerText = `${p} tháng`;
      btn.addEventListener('click', () => {
        currentState.period = p;
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateCalculator();
      });
      periodButtonsContainer.appendChild(btn);
    });
  }

  // Switch Loan Type
  function switchLoanType(type) {
    currentState.type = type;
    const cfg = loanConfig[type];
    if (!cfg) return;

    [tabCccd, tabMotorbike, tabCar].forEach(t => t && t.classList.remove('active'));
    if (type === 'cccd' && tabCccd) tabCccd.classList.add('active');
    else if (type === 'motorbike' && tabMotorbike) tabMotorbike.classList.add('active');
    else if (type === 'car' && tabCar) tabCar.classList.add('active');

    if (amountSlider) {
      amountSlider.min = cfg.min;
      amountSlider.max = cfg.max;
      amountSlider.step = cfg.step;
      amountSlider.value = cfg.defaultVal;
    }
    currentState.amount = cfg.defaultVal;

    if (minAmountLabel) minAmountLabel.innerText = formatShortNumber(cfg.min);
    if (maxAmountLabel) maxAmountLabel.innerText = formatShortNumber(cfg.max);

    renderChips();
    renderPeriods();
    updateCalculator();
  }
  window.switchLoanType = switchLoanType;

  // Update Calculation
  function updateCalculator() {
    const cfg = loanConfig[currentState.type];
    if (!cfg) return;
    if (amountDisplay) amountDisplay.innerText = formatVND(currentState.amount);

    // Calculation: equal principal installment + interest
    const monthlyPrincipal = Math.round(currentState.amount / currentState.period);
    const monthlyInterest = Math.round(currentState.amount * cfg.interestRateMonth);
    const totalMonthly = monthlyPrincipal + monthlyInterest;

    if (summaryAmountText) {
      summaryAmountText.innerText = formatVND(currentState.amount);
    }
    if (resultPrincipal) resultPrincipal.innerText = formatVND(monthlyPrincipal);
    if (resultInterest) resultInterest.innerText = formatVND(monthlyInterest);
    if (resultMonthlyPay) resultMonthlyPay.innerText = formatVND(totalMonthly);
    if (resultPeriodLabel) resultPeriodLabel.innerText = `${currentState.period} tháng`;

    // Highlight matching chip
    document.querySelectorAll('.chip-btn').forEach(btn => {
      const match = cfg.chips.find(c => c.label === btn.innerText);
      if (match && match.value === currentState.amount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Slider Input Listener
  if (amountSlider) {
    amountSlider.addEventListener('input', (e) => {
      currentState.amount = parseInt(e.target.value, 10);
      updateCalculator();
    });
  }

  if (tabCccd) tabCccd.addEventListener('click', () => switchLoanType('cccd'));
  if (tabMotorbike) tabMotorbike.addEventListener('click', () => switchLoanType('motorbike'));
  if (tabCar) tabCar.addEventListener('click', () => switchLoanType('car'));

  // Initialize Calculator with CCCD as default
  switchLoanType('cccd');

  // ===================================================================
  // 2. AMORTIZATION SCHEDULE MODAL
  // ===================================================================
  const btnAmortization = document.getElementById('btnAmortization');
  const amortizationModal = document.getElementById('amortizationModal');
  const closeAmortizationModal = document.getElementById('closeAmortizationModal');
  const amortizationTableBody = document.getElementById('amortizationTableBody');
  const modalLoanSummary = document.getElementById('modalLoanSummary');

  if (btnAmortization) {
    btnAmortization.addEventListener('click', () => {
      buildAmortizationTable();
      if (amortizationModal) amortizationModal.classList.add('active');
    });
  }

  if (closeAmortizationModal && amortizationModal) {
    closeAmortizationModal.addEventListener('click', () => {
      amortizationModal.classList.remove('active');
    });

    amortizationModal.addEventListener('click', (e) => {
      if (e.target === amortizationModal) {
        amortizationModal.classList.remove('active');
      }
    });
  }

  function buildAmortizationTable() {
    const cfg = loanConfig[currentState.type];
    const totalLoan = currentState.amount;
    const months = currentState.period;
    const rate = cfg.interestRateMonth;
    const principalPerMonth = Math.round(totalLoan / months);

    modalLoanSummary.innerText = `Gói vay: ${currentState.type === 'motorbike' ? 'Đăng ký xe máy' : 'Đăng ký ô tô'} | Số tiền: ${formatVND(totalLoan)} | Kỳ hạn: ${months} tháng | Lãi suất: 1.08%/tháng (dư nợ ban đầu)`;

    let remainingBalance = totalLoan;
    let html = '';

    for (let m = 1; m <= months; m++) {
      const interest = Math.round(remainingBalance * rate);
      const principal = m === months ? remainingBalance : principalPerMonth;
      const total = principal + interest;
      remainingBalance -= principal;
      if (remainingBalance < 0) remainingBalance = 0;

      html += `
        <tr>
          <td>Kỳ ${m}</td>
          <td>${formatVND(principal)}</td>
          <td>${formatVND(interest)}</td>
          <td style="font-weight:700; color: var(--primary);">${formatVND(total)}</td>
          <td>${formatVND(remainingBalance)}</td>
        </tr>
      `;
    }
    amortizationTableBody.innerHTML = html;
  }

  // ===================================================================
  // 3. FORM VALIDATION & SUCCESS MODAL (OPTIONAL)
  // ===================================================================
  const loanForm = document.getElementById('heroLoanForm');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const leadCodeDisplay = document.getElementById('leadCodeDisplay');
  const successCustomerName = document.getElementById('successCustomerName');
  const successLoanDetail = document.getElementById('successLoanDetail');

  const citySelect = document.getElementById('loanCity');
  const districtSelect = document.getElementById('loanDistrict');

  if (citySelect && districtSelect) {
    // Sample Districts Mapping
    const districtsData = {
      'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Ba Đình', 'Hoàn Kiếm', 'Thanh Xuân', 'Hai Bà Trưng', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Long Biên', 'Hoàng Mai'],
      'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Gò Vấp', 'Phú Nhuận', 'Thủ Đức', 'Bình Tân'],
      'Bắc Ninh': ['TP. Bắc Ninh', 'Từ Sơn', 'Yên Phong', 'Quế Võ', 'Tiên Du', 'Thuận Thành'],
      'Bình Dương': ['Thủ Dầu Một', 'Thuận An', 'Dĩ An', 'Bến Cát', 'Tân Uyên'],
      'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Cẩm Lệ'],
      'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An']
    };

    citySelect.addEventListener('change', () => {
      const selectedCity = citySelect.value;
      districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
      if (districtsData[selectedCity]) {
        districtsData[selectedCity].forEach(d => {
          const opt = document.createElement('option');
          opt.value = d;
          opt.innerText = d;
          districtSelect.appendChild(opt);
        });
      }
    });
  }

  if (loanForm) {
    loanForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const city = citySelect ? citySelect.value : '';
      const district = districtSelect ? districtSelect.value : '';

      if (!fullName) {
        alert('Vui lòng nhập Họ và tên của bạn.');
        return;
      }

      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phone)) {
        alert('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09).');
        return;
      }

      // Generate random lead tracking code
      const randomCode = 'VAYNHANH-' + Math.floor(100000 + Math.random() * 900000);
      if (leadCodeDisplay) leadCodeDisplay.innerText = randomCode;
      if (successCustomerName) successCustomerName.innerText = fullName;
      if (successLoanDetail) successLoanDetail.innerText = `Khoản vay: ${formatVND(currentState.amount)} trong ${currentState.period} tháng.`;

      if (successModal) successModal.classList.add('active');
      loanForm.reset();
    });
  }

  if (closeSuccessModal && successModal) {
    closeSuccessModal.addEventListener('click', () => {
      successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }

  // ===================================================================
  // 4. BRANCH FILTERING
  // ===================================================================
  const branchCityFilter = document.getElementById('branchCityFilter');
  const branchCards = document.querySelectorAll('.branch-card');

  if (branchCityFilter) {
    branchCityFilter.addEventListener('change', () => {
      const filter = branchCityFilter.value;
      branchCards.forEach(card => {
        const city = card.getAttribute('data-city');
        if (filter === 'all' || city === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ===================================================================
  // 5. FAQ ACCORDION
  // ===================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other items
      faqItems.forEach(other => other.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ===================================================================
  // 6. NAVBAR SCROLL EFFECT & MOBILE MENU & PACKAGES SLIDER
  // ===================================================================
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const floatTopBtn = document.querySelector('.float-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
      if (floatTopBtn) floatTopBtn.classList.add('show');
    } else {
      navbar.classList.remove('scrolled');
      if (floatTopBtn) floatTopBtn.classList.remove('show');
    }
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });
  }

  // Packages slider buttons
  const pkgPrevBtn = document.getElementById('pkgPrevBtn');
  const pkgNextBtn = document.getElementById('pkgNextBtn');
  const packagesGrid = document.getElementById('packagesGrid');

  if (pkgPrevBtn && pkgNextBtn && packagesGrid) {
    pkgPrevBtn.addEventListener('click', () => {
      packagesGrid.scrollBy({ left: -280, behavior: 'smooth' });
    });
    pkgNextBtn.addEventListener('click', () => {
      packagesGrid.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  // Mobile submenu click
  const navItemsWithSub = document.querySelectorAll('.nav-item.has-dropdown');
  navItemsWithSub.forEach(item => {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('dropdown-active');
      }
    });
  });

  if (floatTopBtn) {
    floatTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Quick preset button from product cards to contact section
  window.selectProductAndScroll = function(type, amount, period) {
    if (switchLoanType) switchLoanType(type);
    currentState.amount = amount;
    currentState.period = period;
    if (amountSlider) amountSlider.value = amount;
    if (updateCalculator) updateCalculator();
    const target = document.getElementById('calculator-section') || document.getElementById('calculator');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ===================================================================
  // 7. HIỆU ỨNG SỐ CHẠY TĂNG DẦN (ANIMATED COUNT-UP)
  // ===================================================================
  const counterElements = document.querySelectorAll('.counter-num');
  let hasAnimatedCounters = false;

  function startCountUp() {
    if (hasAnimatedCounters) return;
    hasAnimatedCounters = true;

    counterElements.forEach(counter => {
      const targetVal = parseFloat(counter.getAttribute('data-target'));
      const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
      const useComma = counter.getAttribute('data-comma') === 'true';
      const duration = 2000; // 2 giây chạy mượt mà
      const startTime = performance.now();

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function: easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = easeProgress * targetVal;

        let displayVal = currentNum.toFixed(decimals);
        if (useComma) {
          displayVal = displayVal.replace('.', ',');
        }
        counter.textContent = displayVal;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          let finalVal = targetVal.toFixed(decimals);
          if (useComma) {
            finalVal = finalVal.replace('.', ',');
          }
          counter.textContent = finalVal;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // Kích hoạt khi cuộn tới hoặc ngay khi tải trang
  const statsWrap = document.querySelector('.stats-floating-wrap');
  if (statsWrap && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startCountUp();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(statsWrap);
  } else {
    // Fallback kích hoạt sau 400ms
    setTimeout(startCountUp, 400);
  }
});
