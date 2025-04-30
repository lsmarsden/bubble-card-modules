#!/usr/bin/env python3
import argparse
import os
from pathlib import Path

from json_schema_for_humans.cli import get_schemas_to_render_from_cli_arguments
from json_schema_for_humans.generate import generate_schemas_doc, copy_additional_files_to_target
from json_schema_for_humans.generation_configuration import get_final_config

from template_renderer import MarkdownTemplateRenderer


def main():
    parser = argparse.ArgumentParser(description="Generate schema docs for a given module")
    parser.add_argument("module_dir", help="Path to module directory")
    args = parser.parse_args()

    schema_path = os.path.join(args.module_dir, "schema.yaml")
    output_path = Path(args.module_dir) / "CONFIG_OPTIONS.md"

    config = get_final_config(
        deprecated_from_description=False,
        default_from_description=False,
        expand_buttons=True,
        config="schema_doc_config.json",
        link_to_reused_ref=True
    )

    schemas_to_render = get_schemas_to_render_from_cli_arguments(
        schema_files_or_dir=schema_path,  # input folder
        output_path_or_file=output_path,  # output folder
        result_extension=config.result_extension
    )

    renderer = MarkdownTemplateRenderer(config)

    generate_schemas_doc(schemas_to_render, renderer)
    copy_additional_files_to_target(schemas_to_render, config)


if __name__ == "__main__":
    main()
