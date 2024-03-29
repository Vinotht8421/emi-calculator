const AMOUNT_FORMAT = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

const RENDRED_CHART_DATA = {
  PRINCIPLE: 0,
  INTEREST: 0,
};

// month picker
$(".monthpicker")
  .datepicker({
    format: "MM-yyyy",
    minViewMode: "months",
    autoclose: true,
  })
  .on("change", function (e) {
    calculateEmiAmount();
  });

var CHART_RENDERED = false;

const DATE_PICKER_FORMAT = new Intl.DateTimeFormat(
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  })
);

const DATE_FORMAT = new Intl.DateTimeFormat(
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
);

const loanAmountField = document.querySelector("#loan_amount");
const interestRateField = document.querySelector("#interest_rate");
const loanPeriodField = document.querySelector("#loan_period");
const loanStartDateField = document.querySelector("#loan_start_date");

const fixedEMIField = document.querySelector("#lblFixedEMI");
const variableEMIField = document.querySelector("#lblVariableEMI");

if (loanStartDateField.value == undefined || loanStartDateField.value == "") {
  currentDate = loanStartDateField.value = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
    .split(" ")
    .join("-");
}
const amortTable = document.querySelector("#amort_table");
const amortTableBody = document.querySelector("#amort_table tbody");
const partPayInstallmentField = document.querySelector(
  "#part_payment_installment"
);

const fixedEMIAmountField = document.querySelector("#emi_amount");
const fixedNumberOfPaymentsField = document.querySelector("#number_of_payments");
const actNumberOfPaymentsField = document.querySelector(
  "#actual_number_of_payments"
);
const totalEarlyPaymentsField = document.querySelector("#total_early_payments");
const totalInterestField = document.querySelector("#total_interest");

var amortSchedule = [];

loanAmountField.addEventListener("change", (e) => calculateEmiAmount());
interestRateField.addEventListener("change", (e) => calculateEmiAmount());
loanPeriodField.addEventListener("change", (e) => calculateEmiAmount());
loanStartDateField.addEventListener("change", (e) => calculateEmiAmount());
fixedEMIAmountField.addEventListener("change", (e) => calculateEmiAmount());
fixedNumberOfPaymentsField.addEventListener("change", (e) => calculateEmiAmount());
window.addEventListener("DOMContentLoaded", (event) => {
  calculateEmiAmount();
});

function isNotEmpty(field) {
  return field.value != undefined && field.value != null && field.value != "";
}

function calculateEmiAmount() {
  const partPaymentsField = document.querySelector(
    "input[name='part_payments']:checked"
  );

  const extraPaymentScheule = new Map();

  if (
    isNotEmpty(loanAmountField) &&
    isNotEmpty(interestRateField) &&
    isNotEmpty(loanPeriodField) &&
    isNotEmpty(loanStartDateField)
  ) {
    // ### Do amrtization schedule calculate #### //

    // Gets values from fields
    loanAmount = loanAmountField.value;
    loanAmount = eval(loanAmount.replace(/,/g, ""));
    interestRate = interestRateField.value;
    loanPeriod = loanPeriodField.value * 1;
    loanStartDate = loanStartDateField.value;
    partPayment = 0;
    fixedNumberOfPayments = fixedNumberOfPaymentsField.value * 1;
    fixedEMIAmount = fixedEMIAmountField.value * 1;

    document.querySelectorAll(".scheduled_payment_section").forEach((item) => {
      item.style.display = partPayment == "scheduled_plan" ? null : "none";
    });

    // Calculating EMI
    roi = interestRate / 12 / 100;

    // Preserving extra payments added before a change
    if (partPayment == "scheduled_plan") {
      let frequencyFactor =
        partPaymentFrequency == "monthly"
          ? 1
          : partPaymentFrequency == "quarterly"
          ? 4
          : 12;
      if (partPayInstallment != "" && partPayInstallment > 0) {
        for (let index = 0; index < nom; index++) {
          extraPaymentScheule.set(
            index + 1,
            index % frequencyFactor == 0 ? partPayInstallment : null
          );
        }
      }
    } else {
      const extraPaymentsList = document.querySelectorAll(".extra_payments");

      extraPaymentsList.forEach((payment) => {
        if (isNotEmpty(payment)) {
          extraPaymentScheule.set(
            eval(payment.getAttribute("data-index")) + 1,
            eval(payment.value.replace(/,/g, ""))
          );
        }
      });
    }

    // Write EMI field

    loanAmountField.value = AMOUNT_FORMAT.format(loanAmount);


    const dateParts = loanStartDate.split("-");
    let emiDate = new Date(dateParts[1], month.indexOf(dateParts[0]), 1);
    let beginningBalance = loanAmount;
    let principle = loanAmount;
    let interest;
    amortSchedule = [];
    var totalEarlyPayments = 0;
    var totalInterest = 0;

    let fixedMonths = fixedNumberOfPayments * 12;
    let fixedEMI = fixedEMIAmount;
    let isCompleted = false;
    let fixedMonthCount = 0;
    let variableMonthCount = 0;
    let emi = 0;
    for (var i = 1; i <= fixedMonths; i++) {
      fixedMonthCount = i;
      // This is to make sure the exact amount to be taken for last EMI
      let emiForThisInstallment =
        beginningBalance < fixedEMI ? beginningBalance : fixedEMI;

      emiDate = new Date(emiDate.setMonth(emiDate.getMonth() + 1));
      principle -= emiForThisInstallment;
      interest = beginningBalance * roi;
      totalInterest += beginningBalance * roi;
      extraPaymentForThisInstallment =
        extraPaymentScheule.get(i) != null ? extraPaymentScheule.get(i) : 0;

      if (
        emiForThisInstallment + extraPaymentForThisInstallment >
        beginningBalance - interest
      ) {
        extraPaymentForThisInstallment =
          beginningBalance - (emiForThisInstallment - interest);
      }

      totalPayment =
        emiForThisInstallment ;
      totalEarlyPayments += 0;
      amortSchedule.push({
        emi_number: i,
        payment_date: emiDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        beginning_balance: AMOUNT_FORMAT.format(Math.round(beginningBalance)),
        scheduled_payment: AMOUNT_FORMAT.format(emiForThisInstallment),
        total_payment: AMOUNT_FORMAT.format(Math.round(totalPayment)),
        principle: AMOUNT_FORMAT.format(
          Math.round(emiForThisInstallment - interest)
        ),
        interest: AMOUNT_FORMAT.format(Math.round(interest)),
        extra_payment:
          extraPaymentScheule.get(i) != null
            ? AMOUNT_FORMAT.format(Math.round(extraPaymentForThisInstallment))
            : "",
        ending_balance: AMOUNT_FORMAT.format(
          Math.round(
            beginningBalance -
              (totalPayment < fixedEMI
                ? totalPayment
                : emiForThisInstallment -
                  interest)
          )
        ),
      });

      if (beginningBalance < fixedEMI) {
        isCompleted = true;
        break;
      }

      beginningBalance = (
        beginningBalance -
        (emiForThisInstallment - interest)
      ).toFixed(2);

      if (beginningBalance <= 0) break;
    }

    if(!isCompleted)
    {
    nom = (loanPeriod * 12)-(fixedMonths) ;
    rateVariable = Math.pow(1 + roi, nom);

    emi = Math.round(
      beginningBalance * roi * (rateVariable / (rateVariable - 1))
    );

    for (var i = 1; i <= nom; i++) {
      variableMonthCount = i ;
      // This is to make sure the exact amount to be taken for last EMI
      let emiForThisInstallment =
        beginningBalance < emi ? beginningBalance : emi;

      emiDate = new Date(emiDate.setMonth(emiDate.getMonth() + 1));
      principle -= emiForThisInstallment;
      interest = beginningBalance * roi;
      totalInterest += beginningBalance * roi;
      extraPaymentForThisInstallment =
        extraPaymentScheule.get(i) != null ? extraPaymentScheule.get(i) : 0;

      if (
        emiForThisInstallment + extraPaymentForThisInstallment >
        beginningBalance - interest
      ) {
        extraPaymentForThisInstallment =
          beginningBalance - (emiForThisInstallment - interest);
      }

      totalPayment =
        emiForThisInstallment;
      totalEarlyPayments += 0;
      amortSchedule.push({
        emi_number: i + fixedMonths,
        payment_date: emiDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        beginning_balance: AMOUNT_FORMAT.format(Math.round(beginningBalance)),
        scheduled_payment: AMOUNT_FORMAT.format(emiForThisInstallment),
        total_payment: AMOUNT_FORMAT.format(Math.round(totalPayment)),
        principle: AMOUNT_FORMAT.format(
          Math.round(emiForThisInstallment - interest)
        ),
        interest: AMOUNT_FORMAT.format(Math.round(interest)),
        extra_payment:
          extraPaymentScheule.get(i) != null
            ? AMOUNT_FORMAT.format(Math.round(extraPaymentForThisInstallment))
            : "",
        ending_balance: AMOUNT_FORMAT.format(
          Math.round(
            beginningBalance -
              (totalPayment < emi
                ? totalPayment
                : emiForThisInstallment -
                  interest)
          )
        ),
      });

      if (beginningBalance < emi) {
        break;
      }

      beginningBalance = (
        beginningBalance -
        (emiForThisInstallment - interest)
      ).toFixed(2);

      if (beginningBalance <= 0) break;
    }
  }


    if (amortSchedule.length > 0) {
      if(fixedMonthCount > 0 )
          fixedEMIField.innerText = "EMI ₹"+fixedEMI+" for "+fixedMonthCount+" Months" ;
      else
          fixedEMIField.innerText = "" ;

      if(isCompleted == false && variableMonthCount > 0 )
          variableEMIField.innerText = "EMI ₹"+emi+" for "+variableMonthCount+" Months" ;
      else
          variableEMIField.innerText = "" ;


      amortTable.style.display = "block";

      var tableBody = "";
      amortSchedule.forEach((schedule, index) => {
        tableBody +=
          "<tr class='" +
          (schedule.extra_payment && isPartPaymentEnabled
            ? "table-success"
            : "") +
          "' >";
        tableBody += "<td class='text-center'>" + schedule.emi_number + "</td>";
        tableBody +=
          "<td class='text-center'>" + schedule.payment_date + "</td>";
        tableBody +=
          "<td class='text-right'>" + schedule.beginning_balance + "</td>";
        tableBody +=
          "<td class='text-right hide'>" + schedule.scheduled_payment + "</td>";
        tableBody +=
          "<td class='text-right'>" + schedule.total_payment + "</td>";
        tableBody += "<td class='text-right'>" + schedule.principle + "</td>";
        tableBody += "<td class='text-right'>" + schedule.interest + "</td>";
        tableBody +=
          "<td class='text-right'>" + schedule.ending_balance + "</td>";

        tableBody += "</tr>";
      });

      amortTableBody.innerHTML = tableBody;
    } else {
      amortTable.style.display = "none";
    }

    totalInterestField.value = AMOUNT_FORMAT.format(Math.round(totalInterest));

    renderChart(loanAmount, totalInterest);

    document
      .querySelectorAll(".extra_payments")
      .forEach((e) =>
        e.addEventListener("change", (e) => calculateEmiAmount())
      );
  }
}

function renderChart(principle, interest) {
  if (
    RENDRED_CHART_DATA.PRINCIPLE != principle ||
    RENDRED_CHART_DATA.INTEREST != interest
  ) {
    RENDRED_CHART_DATA.PRINCIPLE = principle;
    RENDRED_CHART_DATA.INTEREST = interest;
  } else {
    return;
  }

  document.querySelector("#chart-area").innerHTML = "";

  var options = {
    series: [Math.round(principle), Math.round(interest)],
    colors: ["#ff6e54", "#dd5182"],
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: function (val) {
          return AMOUNT_FORMAT.format(val);
        },
      },
    },
    chart: {
      type: "pie",
      foreColor: "#373d3f",
      dropShadow: {
        enabled: true,
      },
    },
    labels: ["Loan Principle", "Total Interest"],
    dataLabels: {
      enabled: true,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart-area"), options);
  chart.render();
  CHART_RENDERED = true;
}
