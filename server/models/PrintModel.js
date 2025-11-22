const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const { createCanvas } = require("canvas");

// Helper function to wrap text within maxWidth
function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

class Print {
    // open cash drawer
    static async openCashDrawer(name) {
        let printer = new ThermalPrinter({
            interface: `//localhost/${name}`,
            // interface: "tcp://192.168.0.10",
            type: PrinterTypes.EPSON,
        });
        printer.clear();

        // printer.beep();
        // printer.cut();
        printer.openCashDrawer();

        try {
            await printer.execute();
            printer.clear();
            console.log("successfully cash");

            return {
                message: "cash drawer command received successfully!",
            };
        } catch (e) {
            printer.clear();
            console.log(e);
            throw e;
        }
    }

    // thermal print data

    static calculateLBP(value, rate) {
        return Math.round((value * rate) / 1000) * 1000;
    }

    // parse strings and floats to int if no digits after comma
    static customParse(str) {
        const num = parseFloat(str);
        // Check if number is an integer
        if (Number.isInteger(num)) {
            return parseInt(str, 10);
        }
        return num;
    }

    // thermal print invoice
    static async print(data) {
        let printer = new ThermalPrinter({
            interface: `//localhost/${data.printer}`,
            // interface: "tcp://192.168.0.10",
            type: PrinterTypes.EPSON,
        });

        let settings = data.settings;
        let items = data.items;

        let print_currency = data.print_currency || "usd";

        // beep alert
        printer.beep();
        printer.alignCenter();

        // Check if brand name contains Arabic characters
        const hasArabic = /[\u0600-\u06FF]/.test(settings.brand_name);

        if (hasArabic) {
            const canvasWidth = 576; // thermal printer width
            const lineHeight = 80;

            const canvas = createCanvas(canvasWidth, lineHeight);
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "black";
            ctx.font = "bold 60px 'Arial'"; // adjust size/style
            ctx.textAlign = "center";
            ctx.direction = "rtl"; // important for Arabic
            ctx.fillText(
                settings.brand_name,
                canvasWidth / 2,
                lineHeight * 0.8
            );

            await printer.printImageBuffer(canvas.toBuffer());
        } else {
            // Normal English printing (faster, uses raw ESC/POS)
            printer.alignCenter();
            printer.bold(true);
            printer.setTextSize(1, 1);
            printer.println(settings.brand_name);
        }

        // new line
        printer.newLine();

        // phone number
        printer.setTextNormal();
        printer.println(settings.phone_1);

        printer.drawLine();

        // type and date
        printer.bold(true);
        printer.leftRight(`${data.type}`, `${data.order_date}`);

        printer.newLine();

        // invoice number
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.bold(true);
        printer.println(`#:${data.invoice_number}`);

        printer.setTextNormal();

        printer.newLine();
        printer.drawLine();

        printer.newLine();
        // printer.setTextSize(0, 0);
        // printer.setTypeFontB();
        // table headers
        printer.tableCustom([
            { text: "Description", align: "LEFT", width: 0.45, bold: true },
            { text: "Qty", align: "RIGHT", width: 0.1, bold: true },
            { text: "Unit", align: "RIGHT", width: 0.2, bold: true },
            { text: "Total", align: "RIGHT", width: 0.2, bold: true },
        ]);
        printer.drawLine();
        printer.bold(false);

        printer.setTextSize(0, 0);

        // table body

        for (const element of items) {
            // Config
            const tableWidth = 576;
            const colWidths = [0.5, 0.1, 0.2, 0.2].map((w) => w * tableWidth);
            const lineHeight = 30;

            // Create temporary canvas context to measure text
            const tempCanvas = createCanvas(1, 1);
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.font = "25px 'Arial'";

            // Wrap product_name text
            const productNameLines = wrapText(
                tempCtx,
                element.product_name,
                colWidths[0] - 10
            );

            // Calculate canvas height dynamically based on wrapped lines count
            const canvasHeight = lineHeight * productNameLines.length;

            const canvas = createCanvas(tableWidth, canvasHeight);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.font = "25px 'Arial'";

            // Draw each line of product_name (LTR)
            ctx.textAlign = "left";
            ctx.direction = "ltr";
            productNameLines.forEach((line, idx) => {
                ctx.fillText(line, 0, lineHeight * (idx + 0.8)); // +0.8 for vertical baseline adjustment
            });

            // Draw quantity aligned with first product name line
            ctx.textAlign = "right";
            ctx.fillText(
                this.customParse(element.quantity),
                colWidths[0] + colWidths[1] - 10,
                lineHeight * 0.8
            );

            // Draw unit price
            let unitPriceText =
                print_currency == "usd"
                    ? `$${element.unit_price}`
                    : `${parseInt(element.unit_price).toLocaleString()}`;
            ctx.fillText(
                unitPriceText,
                colWidths[0] + colWidths[1] + colWidths[2] - 10,
                lineHeight * 0.8
            );

            // Draw total price
            let totalPriceText =
                print_currency == "usd"
                    ? `$${element.total_price}`
                    : `${parseInt(element.total_price).toLocaleString()}`;

            ctx.fillText(totalPriceText, tableWidth - 10, lineHeight * 0.8);

            await printer.printImageBuffer(canvas.toBuffer());
            printer.drawLine();
        }

        printer.setTypeFontB();
        printer.setTextNormal();
        printer.newLine();

        // total price
        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.setTextDoubleWidth();
        printer.bold(true);
        let total =
            print_currency == "usd"
                ? `$${data.total_amount}`
                : `${parseInt(data.total_amount).toLocaleString()} L.L`;
        printer.println(`Total: ${total}`);

        printer.newLine();
        printer.newLine();

        // thank you message
        printer.bold(false);
        printer.setTextNormal();
        printer.alignLeft();

        printer.print(data.settings.invoice_note);

        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // +++++++++++++++++++++++++++ If Double Print Enabled +++++++++++++++++++++++++++
        if (data.double_print) {
            printer.cut();
            printer.leftRight(`${data.type}`, `${data.order_date}`);

            printer.newLine();

            // invoice number
            printer.alignCenter();
            printer.setTextDoubleHeight();
            printer.setTextDoubleWidth();
            printer.bold(true);
            printer.println(`#:${data.invoice_number}`);

            printer.setTextNormal();

            printer.newLine();

            printer.tableCustom([
                { text: "Description", align: "LEFT", width: 0.8, bold: true },
                { text: "Qty", align: "LEFT", width: 0.2, bold: true },
            ]);
            printer.drawLine();
            printer.bold(false);

            printer.setTextSize(0, 0);

            for (const element of items) {
                // Config
                const tableWidth = 576;
                const colWidths = [0.8, 0.2].map((w) => w * tableWidth); // 80% and 20%
                const lineHeight = 30;

                // Create temporary canvas context to measure text
                const tempCanvas = createCanvas(1, 1);
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.font = "25px 'Arial'";

                // Wrap product_name text within the wider product name column
                const productNameLines = wrapText(
                    tempCtx,
                    element.product_name,
                    colWidths[0] - 10
                );

                // Calculate canvas height dynamically based on wrapped lines count
                const canvasHeight = lineHeight * productNameLines.length;

                const canvas = createCanvas(tableWidth, canvasHeight);
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "black";
                ctx.font = "25px 'Arial'";

                // Draw each line of product_name (LTR)
                ctx.textAlign = "left";
                ctx.direction = "ltr";
                productNameLines.forEach((line, idx) => {
                    ctx.fillText(line, 0, lineHeight * (idx + 0.8)); // +0.8 for vertical baseline adjustment
                });

                // Draw quantity aligned with first product name line (right side of quantity column)
                ctx.fillText(
                    this.customParse(element.quantity),
                    colWidths[0] + colWidths[1] - 100,
                    lineHeight * 0.8
                );

                await printer.printImageBuffer(canvas.toBuffer());
                printer.drawLine();
            }
        }
        // +++++++++++++++++++++++++++++++ End Double Print ++++++++++++++++++++++++++++++
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // cut paper
        printer.cut();

        try {
            await printer.execute();
            printer.clear();
            console.log("print success!");

            return {
                message: "print success!",
            };
        } catch (e) {
            printer.clear();
            // console.log(e);
            throw e;
        }
    }

    static async printReport(data) {
        const printer = new ThermalPrinter({
            interface: `//localhost/${data.sharedName}`,
            // interface: "tcp://192.168.0.10",
            type: PrinterTypes.EPSON,
        });

        printer.alignCenter();
        printer.setTextDoubleHeight();
        printer.println("Sales Report");
        printer.setTextNormal();
        printer.drawLine();

        printer.alignLeft();
        printer.println(`Start Date: ${data.startDate}`);
        printer.println(`End Date:   ${data.endDate}`);
        printer.newLine();

        printer.println(`Total Orders:      ${data.totalOrders}`);
        printer.println(`Total Items Sold:  ${data.totalItemsSold}`);
        printer.newLine();

        printer.println(`Sales:           ${data.sales}`);
        printer.println(`Returns:         ${data.returns}`);
        printer.println(`Net Sales:       ${data.net}`);
        printer.newLine();

        printer.drawLine();
        printer.println("Thank you!");

        // end
        // printer.beep();
        printer.cut();
        try {
            await printer.execute();
            printer.clear();
            console.log("print success!");

            return {
                message: "print success!",
            };
        } catch (e) {
            printer.clear();
            // console.log(e);
            throw e;
        }
    }
}
module.exports = Print;
