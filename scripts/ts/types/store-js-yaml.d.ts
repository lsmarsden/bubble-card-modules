// `store-js-yaml` is js-yaml 4, the version Bubble Card's store reads module YAML with (see scripts/ts/upstream/bubble-card).
declare module "store-js-yaml" {
  const storeYaml: { load(input: string): unknown };
  export default storeYaml;
}
