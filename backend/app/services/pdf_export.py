"""PDF report generation using reportlab."""
import io
from datetime import datetime


def generate_prediction_report(
    predictions: list,
    staffing: dict,
    menu: dict,
    metrics: dict = None,
) -> bytes:
    """Generate a styled PDF prediction report."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
    except ImportError:
        raise ImportError(
            "reportlab is not installed. Install it with: pip install reportlab"
        )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#16213e"),
        spaceBefore=16,
        spaceAfter=8,
    )
    body_style = styles["BodyText"]

    elements = []

    # Title
    elements.append(Paragraph("YatriLounge — Prediction Report", title_style))
    elements.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        body_style
    ))
    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#e94560")))
    elements.append(Spacer(1, 12))

    # Crowd Predictions
    elements.append(Paragraph("📊 6-Hour Crowd Forecast", subtitle_style))
    pred_data = [["Hour", "Predicted Crowd", "Peak?"]]
    for p in predictions:
        pred_data.append([
            p["hour"],
            f"{p['predicted_crowd']:.0f}",
            "⭐ PEAK" if p.get("is_peak") else "",
        ])

    pred_table = Table(pred_data, colWidths=[2.5 * inch, 1.8 * inch, 1.2 * inch])
    pred_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0f5")]),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(pred_table)
    elements.append(Spacer(1, 16))

    # Staffing
    elements.append(Paragraph("👥 Staffing Recommendations", subtitle_style))
    staff_data = [["Hour", "Crowd", "Staff Needed"]]
    for s in staffing["staffing"]:
        staff_data.append([
            s["hour"],
            f"{s['predicted_crowd']:.0f}",
            str(s["recommended_staff"]),
        ])
    staff_data.append(["", "Max Staff Needed:", str(staffing["total_staff_needed"])])

    staff_table = Table(staff_data, colWidths=[2.5 * inch, 1.8 * inch, 1.2 * inch])
    staff_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f0f5f0")]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e8f5e9")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(staff_table)
    elements.append(Spacer(1, 16))

    # Menu
    elements.append(Paragraph("🍽️ Menu Optimization", subtitle_style))
    menu_data = [["Hour", "Crowd", "Snacks", "Beverages"]]
    for m in menu["hourly"]:
        menu_data.append([
            m["hour"],
            f"{m['predicted_crowd']:.0f}",
            str(m["snack_units"]),
            str(m["beverage_units"]),
        ])
    menu_data.append(["TOTAL", "", str(menu["total_snack_units"]), str(menu["total_beverage_units"])])

    menu_table = Table(menu_data, colWidths=[2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
    menu_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f0f0f8")]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e3f2fd")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(menu_table)
    elements.append(Spacer(1, 16))

    # Metrics
    if metrics:
        elements.append(Paragraph("📈 Model Performance", subtitle_style))
        elements.append(Paragraph(f"MAE: {metrics.get('mae', 'N/A')}", body_style))
        elements.append(Paragraph(f"RMSE: {metrics.get('rmse', 'N/A')}", body_style))
        elements.append(Paragraph(f"Training Samples: {metrics.get('training_samples', 'N/A')}", body_style))

    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#e94560")))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        "Powered by YatriLounge — Intelligent Airport Lounge Peak-Hour Predictor",
        ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=colors.grey)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
